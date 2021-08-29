import React, { useEffect, useState } from 'react'
import { Container } from 'reactstrap'
import Web3 from 'web3'
import { bufferToHex } from 'ethereumjs-util'
import { encrypt } from 'eth-sig-util'

// Contracts
import Config from '../contracts/config.json'

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
			console.log(accounts[0])
		})

		web3.eth.getAccounts().then((accounts) => {
			console.log(accounts[0])

			// Get public key
			let encryptionPublicKey
			window.ethereum
				.request({
					method: 'eth_getEncryptionPublicKey',
					params: [accounts[0]], // you must have access to the specified account
				})
				.then((result) => {
					encryptionPublicKey = result
					const encryptedMessage = bufferToHex(
						Buffer.from(
							JSON.stringify(
								encrypt(
									encryptionPublicKey,
									{ data: 'Hello world!' },
									'x25519-xsalsa20-poly1305'
								)
							),
							'utf8'
						)
					)
					console.log(encryptedMessage)
					decryptMessage(encryptedMessage, accounts[0]).then(
						(decryptedMessage) => console.log(decryptMessage)
					)
				})
				.catch((error) => {
					if (error.code === 4001) {
						// EIP-1193 userRejectedRequest error
						console.log("We can't encrypt anything without the key.")
					} else {
						console.error(error)
					}
				})
		})
	})

	async function loadBlockchainData(network) {
		await window.ethereum.request({ method: 'eth_requestAccounts' })
		window.ethereum.autoRefreshOnNetworkChange = false
	}

	async function decryptMessage(encryptedMessage, account) {
		try {
			const decryptedMessage = await window.ethereum.request({
				method: 'eth_decrypt',
				params: [encryptedMessage, account],
			})
			console.log('The decrypted message is:', decryptedMessage)
			return decryptMessage
		} catch (error) {
			console.log(error.message)
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
			<Container className='tim-container'>
				{alert}

				<h1 style={styles.app_title} className='text-center'>
					Secret Keeper
				</h1>
				<h4 style={styles.description_text} className='text-center'>
					Secure your secrets on the blockchain!
				</h4>
			</Container>
		</React.Fragment>
	)
}
