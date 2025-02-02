import React, { Component } from "react";
import "../../styles/footer.css";

export const Footer = () => (
	<footer className="footer mt-auto py-5 text-center">
		<p className="text-muted">
			Made by <i className="fa fa-heart text-danger" /> {" "}
			<a href="mailto:hello@davilondev.com" target="blank"> hello@davidalondev.com</a>
		</p>
	</footer>
);
