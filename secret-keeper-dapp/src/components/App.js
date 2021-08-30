import React, { useEffect, useState } from 'react'
import { Container, Button } from 'reactstrap'
import Web3 from 'web3'
import { bufferToHex } from 'ethereumjs-util'
import { encrypt } from 'eth-sig-util'

// Contracts
import Config from '../contracts/config.json'

// Components
import SecretNavbar from './SecretNavbar'

// Libraries
import ReactBSAlert from 'react-bootstrap-sweetalert'

const styles = {
	app_title: {
		paddingTop: '20px',
	},
	description_text: {
		marginBottom: '50px',
	},
}

export default function SecretKeeperDapp({ network }) {
	// Models
	const [secrets, setSecrets] = useState([])
	const [account, setAccount] = useState()

	// Contract
	const [web3, setWeb3] = useState(
		new Web3(Web3.givenProvider || Config[network].url)
	)

	// Utility
	const [alert, setAlert] = React.useState(null)

	// Initialize blockchain
	useEffect(() => {
		if (window.ethereum) loadBlockchainData(network)
	}, [network])

	// Watch for web3 events
	useEffect(() => {
		// Check if metamask is setup
		if (!window.ethereum) {
			return displayAlert(
				'Metamask not detected. Please install metamask and try again!',
				'Error'
			)
		}
		// Check if the user changes accounts
		window.ethereum.on('accountsChanged', (accounts) => {
			setAccount(accounts[0])
		})

		web3.eth.getAccounts().then((accounts) => {
			setAccount(accounts[0])
		})
	})

	async function loadBlockchainData(network) {
		await window.ethereum.request({ method: 'eth_requestAccounts' })
		window.ethereum.autoRefreshOnNetworkChange = false
	}

	async function handleEncryptMessage(id, title, message) {
		try {
			const encryptedMessage = await encryptMessage(message)
			setSecrets([
				...secrets,
				{ id, title, message: encryptedMessage, account },
			])
			displayAlert(`Secret has been successfully encrypted`, 'Success')
			return encryptedMessage
		} catch (error) {
			displayAlert(error, 'Error')
		}
	}

	async function handleDecryptMessage(id) {
		try {
			const secret = secrets.filter((secret) => secret.id === id)
			if (secret.length) {
				const decryptedMessage = await decryptMessage(secret[0].message)
				displayAlert(`Decrypted message is '${decryptedMessage}'`, 'Success')
				return decryptedMessage
			} else {
				displayAlert(`Secret with that id does not exist`, 'Error')
			}
		} catch (error) {
			displayAlert(error, 'Error')
		}
	}

	async function encryptMessage(message) {
		try {
			// Request access to public key
			const encryptionPublicKey = await window.ethereum.request({
				method: 'eth_getEncryptionPublicKey',
				params: [account],
			})

			// Encrypt message with public key
			const encryptedMessage = bufferToHex(
				Buffer.from(
					JSON.stringify(
						encrypt(
							encryptionPublicKey,
							{ data: message },
							'x25519-xsalsa20-poly1305'
						)
					),
					'utf8'
				)
			)
			// Return encrypted message
			return encryptedMessage
		} catch (error) {
			if (error.code === 4001) {
				// EIP-1193 userRejectedRequest error
				throw "We can't encrypt anything without the key."
			} else {
				throw error
			}
		}
	}

	async function decryptMessage(encryptedMessage) {
		try {
			const decryptedMessage = await window.ethereum.request({
				method: 'eth_decrypt',
				params: [encryptedMessage, account],
			})
			return decryptedMessage
		} catch (error) {
			throw error.message
		}
	}

	function displayAlert(message, type) {
		const successTitles = ['Nice!', 'Awesome!', 'Good Job!']
		let randomSuccessTitle =
			successTitles[Math.floor(Math.random() * successTitles.length)]

		switch (type) {
			case 'Success': {
				setAlert(
					<ReactBSAlert
						success
						style={{ display: 'block', marginTop: '-100px' }}
						title={randomSuccessTitle}
						onConfirm={() => hideAlert()}
						onCancel={() => hideAlert()}
						confirmBtnBsStyle='info'
						btnSize=''>
						{message}
					</ReactBSAlert>
				)
				break
			}
			case 'Error': {
				setAlert(
					<ReactBSAlert
						error
						style={{ display: 'block', marginTop: '-100px' }}
						title='Uh Oh!'
						onConfirm={() => hideAlert()}
						onCancel={() => hideAlert()}
						confirmBtnBsStyle='danger'
						btnSize=''>
						{message}
					</ReactBSAlert>
				)
				break
			}
		}
	}

	const hideAlert = () => {
		setAlert(null)
	}

	return (
		<React.Fragment>
			<SecretNavbar handleEncryptMessage={handleEncryptMessage} />
			<Container className='tim-container'>
				{alert}
				<Button
					color='warning'
					onClick={() =>
						handleEncryptMessage(1, 'Encrypt this', 'This should be encrypted!')
					}>
					Encrypt
				</Button>
				<Button color='success' onClick={() => handleDecryptMessage(1)}>
					Decrypt
				</Button>
			</Container>
		</React.Fragment>
	)
}
