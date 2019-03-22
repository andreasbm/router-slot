import { unsafeCSS } from "lit-element";

export const sharedStyles = unsafeCSS`
	router-link {
		cursor: pointer;
	    border-bottom: 2px solid currentColor;
	    outline: none;
	    color: grey;
	}
	
	router-link:focus, router-link:hover {
		color: black;
	}
	
	router-link[active] {
		color: red;
	}
`;