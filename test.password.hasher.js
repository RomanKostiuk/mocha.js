import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import * as argon2 from 'argon2';

import { createPasswordManager } from '../passwordManager.js';

describe('Password Manager', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('should return true if hash file exists', () => {
        const fsMock = { existsSync: sinon.stub().returns(true) };
        const manager = createPasswordManager({ fileSystem: fsMock });

        expect(manager.hashFileExists()).to.be.true;
    });

    it('should read hash from file and apply chmod', () => {
        const fsMock = {
            chmodSync: sinon.stub(),
            readFileSync: sinon.stub().returns('   hashedpassword   ')
        };
        const manager = createPasswordManager({ fileSystem: fsMock });

        const result = manager.readHashFromFile();
        expect(result).to.equal('hashedpassword');
    });

    it('should throw an error if reading the file fails', () => {
        const fsMock = {
            chmodSync: sinon.stub().throws(new Error('fail'))
        };
        const manager = createPasswordManager({ fileSystem: fsMock });

        expect(() => manager.readHashFromFile()).to.throw('Помилка читання файлу');
    });

    it('should save password with hash and set file permissions', async () => {
        const hasherMock = { hash: sinon.stub().resolves('somehash') };
        const fsMock = {
            writeFileSync: sinon.stub(),
            chmodSync: sinon.stub()
        };
        const manager = createPasswordManager({ hasher: hasherMock, fileSystem: fsMock });

        await manager.savePassword('password123');

        expect(hasherMock.hash.calledOnce).to.be.true;
        expect(fsMock.writeFileSync.calledWith('password_hash.txt', 'somehash')).to.be.true;
        expect(fsMock.chmodSync.calledWith('password_hash.txt', 0o444)).to.be.true;
    });

    it('should verify password correctly', async () => {
        const hasherMock = { verify: sinon.stub().resolves(true) };
        const manager = createPasswordManager({ hasher: hasherMock });

        const result = await manager.verifyPassword('storedhash', 'input');
        expect(result).to.be.true;
    });

    it('should throw error if hash is invalid during verification', async () => {
        const hasherMock = { verify: sinon.stub().throws(new Error('bad hash')) };
        const manager = createPasswordManager({ hasher: hasherMock });

        try {
            await manager.verifyPassword('bad', 'pass');
        } catch (e) {
            expect(e.message).to.equal('Файл містить недійсний хеш');
        }
    });
});
