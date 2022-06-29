const api = require('../api/twitter');

describe('Test Suite Zero', () => {
    it('should use download-tweets and throw error', async () => {
        await expect(api.downloadTweets('Test')).rejects.toThrow(Error);        
    });
    it('should use get-mentions and throw error', async () => {
        await expect(api.downloadFollowers('Test')).rejects.toThrow(Error);  
    });
    it('should use download-followers and throw error', async () => {
        await expect(api.getMentions('Test')).rejects.toThrow(Error); 
    });
    it('should use get-followers and throw error', async () => {
        await expect(api.getFollowers('Test')).rejects.toThrow(Error); 
    });
});