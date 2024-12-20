import { SettingsManager } from '../../../public/js/settings';
import { showMessage } from '../../../public/js/utils';

describe('SettingsManager', () => {
    let settingsManager;

    beforeEach(() => {
        // Reset fetch mock
        global.fetch.mockReset();
        
        // Create instance
        settingsManager = new SettingsManager();
    });

    test('loads global settings successfully', async () => {
        const mockData = { data: { globalUpperLimit: 10 } };
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockData)
            })
        );

        await settingsManager.loadGlobalSettings();
        expect(settingsManager.globalUpperLimitInput.value).toBe('10');
    });

    test('handles save global settings with valid input', async () => {
        settingsManager.globalUpperLimitInput.value = '15';
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true })
            })
        );

        await settingsManager.saveGlobalSettings();
        expect(global.fetch).toHaveBeenCalledWith('/api/settings', expect.any(Object));
        expect(showMessage).toHaveBeenCalledWith('Global upper limit saved successfully', 'success');
    });

    test('prevents setting global limit below 1', () => {
        const event = { target: settingsManager.globalUpperLimitInput };
        settingsManager.globalUpperLimitInput.value = '0';
        settingsManager.handleInputValidation(event);
        expect(settingsManager.globalUpperLimitInput.value).toBe('1');
    });
});