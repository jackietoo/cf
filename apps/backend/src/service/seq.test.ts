import { describe, it } from 'vitest';
import { getNextSequence, SequenceTypeEnum } from './seq';

describe('Sequence Generator Tests', () => {
  it('should generate correct values and types for all enums', async () => {
    // 1. 测试 USER (数字类型)
    const userResult = await getNextSequence(SequenceTypeEnum.USER);
    console.log('USER Result:', userResult, '| Type:', typeof userResult);

    // 2. 测试 ORDER (字符串类型)
    const orderResult = await getNextSequence(SequenceTypeEnum.ORDER);
    console.log('ORDER Result:', orderResult, '| Type:', typeof orderResult);

    // 3. 测试 PRODUCT (字符串类型)
    const productResult = await getNextSequence(SequenceTypeEnum.PRODUCT);
    console.log('PRODUCT Result:', productResult, '| Type:', typeof productResult);

    const new1 = await getNextSequence(SequenceTypeEnum.NEW_TEST);
    console.log('NEW_TEST Result:', new1, '| Type:', typeof new1);
  });
});
