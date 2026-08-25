// 手术 → 量表 / 病症 → 手术 关系映射（原型数据）

export interface SurgeryScaleRule {
  /** 手术名称（含关键词匹配） */
  surgery: string;
  /** 常见对应病症（关键词） */
  diagnoses: string[];
  /** 该手术对应的量表（唯一一组，不区分术前/术中/术后） */
  scales: string[];
  /** 康复方向标签 */
  rehabTag: string;
}

export const surgeryScaleRules: SurgeryScaleRule[] = [
  {
    surgery: "THA 翻修",
    diagnoses: ["髋关节假体植入感染", "股骨假体周围骨折", "髋关节假体松动"],
    scales: ["Harris 髋关节评分", "VAS 疼痛评分", "WOMAC", "SF-36 生活质量"],
    rehabTag: "髋关节翻修康复",
  },
  {
    surgery: "TKA",
    diagnoses: ["原发性单侧膝关节病", "膝关节骨性关节炎", "类风湿性膝关节炎"],
    scales: ["HSS 膝关节评分", "KSS 膝关节评分", "WOMAC", "VAS", "ROM 关节活动度"],
    rehabTag: "膝关节置换康复",
  },
  {
    surgery: "ACLR",
    diagnoses: ["膝关节前十字韧带损伤", "ACL 断裂"],
    scales: ["IKDC 主观膝评分", "Lysholm 评分", "Tegner 活动等级", "KOOS", "VAS"],
    rehabTag: "ACL 重建康复",
  },
  {
    surgery: "THA 翻修 + 骨折内固定",
    diagnoses: ["股骨假体周围骨折", "Vancouver B2/B3 型骨折"],
    scales: ["Harris 髋关节评分", "VAS 疼痛评分", "骨折 Vancouver 分型", "负重进程记录"],
    rehabTag: "假体周围骨折康复",
  },
];


/** 根据手术名称模糊匹配规则 */
export function matchRule(surgery: string): SurgeryScaleRule | undefined {
  if (!surgery) return undefined;
  const s = surgery.replace(/\s/g, "");
  return surgeryScaleRules.find((r) => s.includes(r.surgery.replace(/\s/g, "")));
}
