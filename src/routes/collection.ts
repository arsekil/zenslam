import { html } from "../lib/html";
import '../style.css';

document.querySelector<HTMLDivElement>('#collection')!.innerHTML = html`
this is the collection page. It will contain a list of all the poems that have been submitted to the site. Each poem will be displayed as a link to the individual poem page.
`;