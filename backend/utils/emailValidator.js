import dns from "dns";
import disposableDomainsList from "disposable-email-domains" with { type: "json" };

// Set of disposable domains for fast O(1) lookups
const disposableDomainsSet = new Set(disposableDomainsList);

// Additional common burner domains for extra coverage
const ADDITIONAL_DISPOSABLE_DOMAINS = [
    "tempmail.com", "guerrillamail.com", "10minutemail.com", "mailinator.com",
    "yopmail.com", "sharklasers.com", "throwawaymail.com", "dispostable.com",
    "getairmail.com", "mohmal.com", "trashmail.com", "burnermail.io",
    "dropmail.me", "fakeinbox.com", "temp-mail.org", "crazymailing.com",
    "generator.email", "fakemailgenerator.com", "emailondeck.com", "maildrop.cc",
    "mytemp.email", "getnada.com", "inboxkitten.com", "trashmail.net"
];
for (const domain of ADDITIONAL_DISPOSABLE_DOMAINS) {
    disposableDomainsSet.add(domain.toLowerCase());
}

// RFC 5322 compliant regex for strict email validation
const EMAIL_SYNTAX_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Resolves MX records for a domain with a strict timeout to prevent thread blocking.
 */
const resolveMxWithTimeout = async (domain, timeoutMs = 3500) => {
    try {
        const mxPromise = dns.promises.resolveMx(domain);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("DNS_TIMEOUT")), timeoutMs)
        );
        const addresses = await Promise.race([mxPromise, timeoutPromise]);
        return addresses && addresses.length > 0;
    } catch (err) {
        if (err.code === "ENOTFOUND" || err.code === "ENODATA" || err.code === "NODATA") {
            return false;
        }
        if (err.message === "DNS_TIMEOUT") {
            console.warn(`[Email Validator] MX resolution timed out for domain: ${domain}. Allowing fallback.`);
            return true; // Allow pass on DNS timeout to prevent blocking legit users during ISP lag
        }
        console.warn(`[Email Validator] DNS check error for ${domain}:`, err.message);
        return false;
    }
};

/**
 * Validates email format, checks for disposable/temporary domains, and verifies MX records.
 *
 * @param {string} email - The email address to validate
 * @returns {Promise<{ isValid: boolean, cleanEmail?: string, domain?: string, message?: string }>}
 */
export const validateEmailWithMxAndDisposable = async (email) => {
    if (!email || typeof email !== "string") {
        return { isValid: false, message: "Email address is required." };
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Length & Basic Syntax Validation
    if (cleanEmail.length > 254 || !EMAIL_SYNTAX_REGEX.test(cleanEmail)) {
        return { isValid: false, message: "Please enter a valid, complete email address." };
    }

    const parts = cleanEmail.split("@");
    if (parts.length !== 2) {
        return { isValid: false, message: "Invalid email structure." };
    }

    const [user, domain] = parts;

    if (!user || user.length > 64) {
        return { isValid: false, message: "Email username section is invalid." };
    }

    if (!domain || domain.length > 253 || !domain.includes(".")) {
        return { isValid: false, message: "Email domain is invalid." };
    }

    // 2. Check for Disposable/Temporary Email Domains
    if (disposableDomainsSet.has(domain)) {
        return {
            isValid: false,
            message: "Please use a permanent email address. Temporary or disposable emails are not allowed."
        };
    }

    // 3. DNS MX Record Resolution (Confirms domain can receive mail)
    const hasMx = await resolveMxWithTimeout(domain);
    if (!hasMx) {
        return {
            isValid: false,
            message: `The domain "${domain}" does not have active mail servers (MX) and cannot receive emails. Please check for typos.`
        };
    }

    return {
        isValid: true,
        cleanEmail,
        domain
    };
};

export default validateEmailWithMxAndDisposable;
