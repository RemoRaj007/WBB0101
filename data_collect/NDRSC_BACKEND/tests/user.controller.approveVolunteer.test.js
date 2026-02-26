const test = require('node:test');
const assert = require('node:assert/strict');

const controller = require('../controllers/user.controller');

function createRes() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

function withMock(modulePath, mockExports, fn) {
    const resolved = require.resolve(modulePath);
    const previous = require.cache[resolved];
    require.cache[resolved] = {
        id: resolved,
        filename: resolved,
        loaded: true,
        exports: mockExports
    };

    return Promise.resolve()
        .then(fn)
        .finally(() => {
            if (previous) {
                require.cache[resolved] = previous;
            } else {
                delete require.cache[resolved];
            }
        });
}

test('approveVolunteer returns 400 when status is active and district is missing', async () => {
    const mockDb = {
        VolunteerRequest: {
            findByPk: async () => ({
                id: 1,
                name: 'Jane Doe',
                email: 'jane@example.com',
                nic: '123456789V',
                enumeratorId: 'EN-001'
            })
        }
    };

    const req = {
        params: { id: '1' },
        body: { status: 'active', district: '   ' }
    };
    const res = createRes();

    await withMock('../models', mockDb, async () => {
        await controller.approveVolunteer(req, res);
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'District is required for approval.');
});

test('approveVolunteer passes normalized district to createUser', async () => {
    let receivedDistrict = null;

    const requestRecord = {
        id: 7,
        name: 'John Smith',
        email: 'john@example.com',
        password: 'hashed-pass',
        nic: '200000000V',
        enumeratorId: 'EN-777',
        destroy: async () => {}
    };

    const createdUser = {
        id: 99,
        email: 'john@example.com',
        district: 'Kandy',
        role: 'UN Volunteer',
        status: 'active',
        password: '',
        save: async function () {}
    };

    const mockDb = {
        VolunteerRequest: {
            findByPk: async () => requestRecord
        },
        User: {
            findOne: async () => createdUser
        }
    };

    const mockUserService = {
        createUser: async (payload) => {
            receivedDistrict = payload.district;
            return { id: 99 };
        }
    };

    const req = {
        params: { id: '7' },
        body: { status: 'active', district: '  Kandy  ' }
    };
    const res = createRes();

    await withMock('../models', mockDb, async () => {
        await withMock('../services/user.service', mockUserService, async () => {
            await controller.approveVolunteer(req, res);
        });
    });

    assert.equal(receivedDistrict, 'Kandy');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.district, 'Kandy');
});
