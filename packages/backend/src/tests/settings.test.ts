describe('Settings API', () => {
    it('should get default settings', async () => {
        const response = await request(app)
            .get('/api/settings')
            .expect(200);
        
        expect(response.body.data.globalUpperLimit).toBeDefined();
    });

    it('should update settings', async () => {
        const response = await request(app)
            .post('/api/settings')
            .send({ globalUpperLimit: 50 })
            .expect(200);
        
        expect(response.body.data.globalUpperLimit).toBe(50);
    });
});