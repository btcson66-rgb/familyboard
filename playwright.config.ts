import { defineConfig, devices } from '@playwright/test';
const port = process.env.E2E_PORT || '4321';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({ testDir:'./tests/e2e', timeout:45000, use:{baseURL,trace:'retain-on-failure'}, webServer:{command:`node scripts/serve-dist.mjs`,url:baseURL,reuseExistingServer:false,timeout:120000,env:{PORT:port}}, projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['Pixel 7']}}] });
