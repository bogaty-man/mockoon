import { Environment } from '@mockoon/commons';
import { expect } from 'chai';
import { promises as fs } from 'fs';
import { Settings } from 'src/shared/models/settings.model';
import { Tests } from 'test/lib/tests';

describe('Schema validation', () => {
  describe('Unable to migrate, repair', () => {
    const tests = new Tests('schema-validation/broken');

    it('should fail migration and repair if too broken (route object missing)', async () => {
      await tests.helpers.checkToastDisplayed(
        'warning',
        'Migration of environment "Missing route object" failed. The environment was automatically repaired and migrated to the latest version.'
      );

      await tests.helpers.verifyObjectPropertyInFile(
        './tmp/storage/environment-0.json',
        ['lastMigration', 'routes'],
        [16, []]
      );
    });
  });

  describe('Generic (test with Settings)', () => {
    const genericTestCases = [
      {
        path: 'schema-validation/empty-file',
        describeTitle: 'Empty file',
        testTitle: 'should fix empty file',
        preTest: async (fileContent) => {
          expect(() => {
            JSON.parse(fileContent);
          }).to.throw('Unexpected end of JSON input');
        }
      },
      {
        path: 'schema-validation/null-content',
        describeTitle: 'Null content',
        testTitle: 'should fix null content',
        preTest: async (fileContent) => {
          expect(JSON.parse(fileContent)).to.equal(null);
        }
      },
      {
        path: 'schema-validation/empty-object',
        describeTitle: 'Empty object',
        testTitle: 'should fix empty object',
        preTest: async (fileContent) => {
          expect(JSON.parse(fileContent)).to.be.an('object');
        }
      },
      {
        path: 'schema-validation/corrupted-content',
        describeTitle: 'Corrupted content',
        testTitle: 'should fix corrupted content',
        preTest: async (fileContent) => {
          expect(JSON.parse(fileContent)).to.be.an('object');
        }
      }
    ];

    genericTestCases.forEach((genericTestCase) => {
      describe(genericTestCase.describeTitle, () => {
        const tests = new Tests(genericTestCase.path, true, true, false);

        it(genericTestCase.testTitle, async () => {
          const fileContent = (
            await fs.readFile('./tmp/storage/settings.json')
          ).toString();

          genericTestCase.preTest(fileContent);

          await tests.helpers.waitForAutosave();

          await tests.helpers.verifyObjectPropertyInFile(
            './tmp/storage/settings.json',
            'welcomeShown',
            false
          );
        });
      });
    });
  });

  describe('Settings', () => {
    const tests = new Tests('schema-validation/settings', true, true, false);

    it('should verify initial properties (missing, invalid, unknown)', async () => {
      const fileContent: Settings = JSON.parse(
        (await fs.readFile('./tmp/storage/settings.json')).toString()
      );

      expect(fileContent.logsMenuSize).to.be.undefined;
      expect(fileContent.bannerDismissed).to.be.undefined;
      expect((fileContent as any).unknown).to.equal(true);
      expect(fileContent.environments).to.include.members([null, 'unknown']);
      expect(fileContent.environments[2]).to.include({
        uuid: '',
        path: '/home/username/file1.json'
      });
    });

    it('should verify saved properties (missing, invalid, unknown)', async () => {
      await tests.helpers.waitForAutosave();
      const fileContent: Settings = JSON.parse(
        (await fs.readFile('./tmp/storage/settings.json')).toString()
      );

      // add missing properties with default
      expect(fileContent.logsMenuSize).to.equal(150);
      expect(fileContent.bannerDismissed)
        .to.be.an('array')
        .that.have.lengthOf(0);

      // remove unknown values
      expect((fileContent as any).unknown).to.be.undefined;
      // remove invalid values
      expect(fileContent.environments).to.be.an('array').that.have.lengthOf(0);
    });
  });

  describe('Environments', () => {
    const tests = new Tests('schema-validation/environments');

    it('should verify initial properties (missing, invalid, unknown)', async () => {
      const fileContent: Environment = JSON.parse(
        (await fs.readFile('./tmp/storage/environment-0.json')).toString()
      );

      expect(fileContent.routes[0].uuid).to.equal('non-uuid');

      expect(fileContent.name).to.be.undefined;
      expect(fileContent.routes[0].responses[0].rulesOperator).to.equal(
        'DUMMY'
      );
      expect(fileContent.routes[0].enabled).to.equal(null);
      expect(fileContent.routes[0].responses[0].statusCode).to.equal(99);

      // allow empty body
      expect(fileContent.routes[0].responses[0].body).to.equal('');

      // allow null in target
      expect(fileContent.routes[0].responses[0].rules[0].target).to.equal(null);
      // allow enum in target
      expect(fileContent.routes[0].responses[0].rules[1].target).to.equal(
        'invalid'
      );

      // invalid array item
      expect(fileContent.routes[0].responses[0].headers)
        .to.be.an('array')
        .that.have.lengthOf(2);
      expect(
        (fileContent.routes[0].responses[0].headers[0] as any).unknown
      ).to.equal(true);
    });

    it('should verify saved properties (missing, invalid, unknown)', async () => {
      await tests.helpers.waitForAutosave();
      const fileContent: Environment = JSON.parse(
        (await fs.readFile('./tmp/storage/environment-0.json')).toString()
      );

      expect(fileContent.routes[0].uuid).to.be.a.uuid('v4');

      expect(fileContent.name).to.equal('New environment');
      expect(fileContent.routes[0].responses[0].rulesOperator).to.equal('OR');
      expect(fileContent.routes[0].enabled).to.equal(true);
      expect(fileContent.routes[0].responses[0].statusCode).to.equal(200);

      // allow empty body
      expect(fileContent.routes[0].responses[0].body).to.equal('');

      // allow null in target
      expect(fileContent.routes[0].responses[0].rules[0].target).to.equal(null);
      // allow enum in target
      expect(fileContent.routes[0].responses[0].rules[1].target).to.equal(null);

      // strip invalid array item
      expect(fileContent.routes[0].responses[0].headers)
        .to.be.an('array')
        .that.have.lengthOf(1);
      expect(fileContent.routes[0].responses[0].headers[0].key).to.equal(
        'Content-Type'
      );
    });
  });
});
