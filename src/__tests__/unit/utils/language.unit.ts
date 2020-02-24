import { expect } from '@loopback/testlab';
import filterAsync from 'node-filter-async';

function resolveAfterDelay(delayMs: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, delayMs);
  });
}

describe('LanguageTest', () => {
  it('awaits in filter', async () => {
    let count = 0;
    const vals = [0, 1, 2, 3, 4, 5];
    const filteredVals = await filterAsync(vals, async val => {
      if (val % 2 == 0) {
        count++;
        const response = await resolveAfterDelay(200);
        expect(response).to.equal('resolved');
        return true;
      } else {
        return false;
      }
    });

    expect(filteredVals.length).to.equal(3);
    expect(count).to.equal(3);
  });
});
