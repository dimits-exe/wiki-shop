/**
 * A class that keeps track of the user's details in relation to the server.
 * @dimits-exe
 */
export class User {
    #username
    #sessionId

    /**
     * Constructs a new user instance.
     * @param {string | null} username the user's name, null if not logged in
     */
    constructor(username = null) {
        this.#username = username
        this.#sessionId = null
    }

    /**
     * Check whether the user has logged in. This method does NOT check whether the login
     * information is valid.
     * @returns true if the user has logged in
     */
    isLoggedIn() {
        return this.#username !== null
    }

    get username() {
        if (this.#username === null)
            throw new Error("Username was never set")
        else
            return this.#username
    }

    set username(username) {
        this.#username = username;
    }

    get sessionId() {
        if (this.#sessionId === null)
            throw new Error("Session ID was never set")
        else
            return this.#sessionId
    }

    /**
     * Save the current session ID.
     * @param {string} sessionId the newly acquired session ID
     */
    set sessionId(sessionId) { this.#sessionId = sessionId; }
}