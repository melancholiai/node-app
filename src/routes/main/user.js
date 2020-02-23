class User {
    constructor(authId) {
        this.authId = authId;
        this.friends = [];
        this.blackList = [];
        this.posts = [];
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
    }
}