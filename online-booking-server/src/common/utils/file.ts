


export const getCallerFile = (): string | undefined => {
  const stack = new Error().stack;
  if (!stack) return undefined;
  const lines = stack.split('\n');
  // lines[0] 是 Error
  // lines[1] 是当前函数
  // lines[2] 是调用 getCallerFile 的地方
  // lines[3] 是再上一层（即你要的调用者）
  const match = lines[3]?.match(/\((.*):\d+:\d+\)$/) || lines[3]?.match(/at (.*):\d+:\d+$/);
  return match ? match[1] : undefined;
}