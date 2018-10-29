/**
 * Check for issues with the provided link URL.
 * (e.g. invalid characters, or an unexpected syntax).
 *
 * @param {string} linkURL The link URL.
 *
 * @return {boolean} Is the URL invalid?
 */
export function isInvalidLinkURL( linkURL ) {
	const trimmedURL = linkURL.trim();

	// If the URL doesn't begin with 'http' skip validation.
	if ( ! /^http/i.test( trimmedURL ) ) {
		return false;
	}

	// This expression tests that there's a period preceding the URL's TLD
	// and that forward slashes are positioned after the TLD.
	if ( ! /^https?:\/\/[^\/]+\.[^\/]+($|\/)/i.test( trimmedURL ) ) {
		return true;
	}

	// This expression checks for invalid characters, including a hyphen
	// directly after the protocol and invalid chars in the domain (e.g. ?.#/)
	if ( ! /^https?:\/\/([^\s/?.#-][^\s\/?.#]*\.?)+(\/[^\s"]*)?$/i.test( trimmedURL ) ) {
		return true;
	}

	return false;
}
