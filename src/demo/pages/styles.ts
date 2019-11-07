import { unsafeCSS } from "lit-element";

export const sharedStyles = unsafeCSS`
	router-link {
	    border-bottom: 2px solid currentColor;
	    outline: none;
	}
	
	router-link, a {
	    color: grey;
		cursor: pointer;
	}

	router-link:focus, router-link:hover, a:hover, a:focus {
		color: black;
	}
	
	router-link[active] {
		color: red;
	}
	
	a[data-active] {
		color: red;
	}
	
`;