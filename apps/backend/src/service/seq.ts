export const SequenceTypeEnum = {
  USER: 'USER',
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  NEW_TEST: 'NEW_TEST',
} as const;

export type SequenceType = (typeof SequenceTypeEnum)[keyof typeof SequenceTypeEnum];

interface NumberRule {
  format: false;
}

interface StringRule {
  format: true;
  padWidth?: number;
  prefix?: string;
}

type SequenceRule = NumberRule | StringRule;

// 🌟 注意：这里用了 Partial，允许 SEQUENCE_RULES 里不写全所有枚举
const SEQUENCE_RULES: Partial<Record<SequenceType, SequenceRule>> = {
  [SequenceTypeEnum.ORDER]: { format: true, padWidth: 6, prefix: 'ORD-' },
  [SequenceTypeEnum.PRODUCT]: { format: true, padWidth: 4, prefix: 'PROD-' },
  // NEW_TEST 没写在这里，它会自动走默认逻辑！
} as const;

export async function getNextSequence<T extends SequenceType>(
  type: T,
): Promise<
  // 🌟 核心改进：如果没在规则里，或者 format 不是 true，则返回值自动推导为 number
  T extends keyof typeof SEQUENCE_RULES
    ? (typeof SEQUENCE_RULES)[T] extends { format: true }
      ? string
      : number
    : number
> {
  const rule = (SEQUENCE_RULES[type] as SequenceRule) || { format: false };

  if (rule.format) {
    return 'a' as any;
  } else {
    return 10 as any;
  }
}
