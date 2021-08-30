import React, { useState } from 'react'
import {
	Navbar,
	NavbarBrand,
	NavbarToggler,
	Collapse,
	Nav,
	NavLink,
	NavItem,
	Container,
	Form,
	FormGroup,
	Input,
	Button,
} from 'reactstrap'

const styles = {
	title: {
		fontSize: '24px',
		color: 'white',
		padding: '5px 0px 5px',
	},
	search: {
		width: '250px',
	},
	close: {
		top: '0px',
	},
	btn__padding: {
		padding: '0',
	},
	nav: {
		padding: '0px 0px',
	},
}

export default function SecretNavbar() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Navbar expand='lg' color='primary'>
			<Container>
				<NavbarBrand style={styles.title}>Secret Keeper</NavbarBrand>
				<NavbarToggler onClick={() => setIsOpen(!isOpen)}>
					<span className='navbar-toggler-bar navbar-kebab'></span>
					<span className='navbar-toggler-bar navbar-kebab'></span>
					<span className='navbar-toggler-bar navbar-kebab'></span>
				</NavbarToggler>
				<Collapse isOpen={isOpen} navbar>
					<Form inline className='ml-auto'>
						<FormGroup className='no-border'>
							<Input type='text' placeholder='Search' style={styles.search} />
						</FormGroup>
						<Button color='neutral' className='btn-icon btn-round' outline>
							<i className='fa fa-plus' />
						</Button>
					</Form>
				</Collapse>
			</Container>
		</Navbar>
	)
}
