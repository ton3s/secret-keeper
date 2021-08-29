import React, { useEffect, useState } from 'react'
import { Container } from 'reactstrap'
import Web3 from 'web3'

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
		})
	})

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
