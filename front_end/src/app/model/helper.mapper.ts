export function mapToOpionalDate(
  optionalDate: string | undefined,
): Date | undefined {
  if (optionalDate) {
    return new Date(optionalDate);
  }
  return undefined;
}

export function mapToOptionalDateStr(
  optionalDate: Date | undefined,
): string | undefined {
  if (optionalDate) {
    return optionalDate.toISOString();
  }
  return undefined;
}
