function calcAngleDegrees(x: number, y: number) {
  return (Math.atan2(y, x) * 180) / Math.PI;
}
export function addVector(
  point: { x: number; y: number },
  slopeVec: { x: number; y: number },
  unit: number
) {
  const AngleDegrees = calcAngleDegrees(slopeVec.x, slopeVec.y);
  let x1 = point.x + Math.cos((AngleDegrees * Math.PI) / 180) * unit;
  let y1 = point.y + Math.sin((AngleDegrees * Math.PI) / 180) * unit;
  return { x: x1, y: y1 };
}

export function parallelTransform(
  point: { x: number; y: number },
  slopeVec: { x: number; y: number },
  unit: number
) {
  const AngleDegrees = calcAngleDegrees(slopeVec.x, slopeVec.y) + 90;
  let x1 = point.x + Math.cos((AngleDegrees * Math.PI) / 180) * unit;
  let y1 = point.y + Math.sin((AngleDegrees * Math.PI) / 180) * unit;
  return { x: x1, y: y1 };
}
