// 手术 → 量表 / 病症 → 手术 关系映射（原型数据）

export interface SurgeryScaleRule {
  /** 手术名称（含关键词匹配） */
  surgery: string;
  /** 常见对应病症（关键词） */
  diagnoses: string[];
  /** 术前 / 术中 / 术后需填写的量表 */
  scales: {
    preOp: string[];
    intraOp: string[];
    postOp: string[];
  };
  /** 康复方向标签 */
  rehabTag: string;
}

export const surgeryScaleRules: SurgeryScaleRule[] = [
  {
    surgery: "THA 翻修",
    diagnoses: ["髋关节假体植入感染", "股骨假体周围骨折", "髋关节假体松动"],
    scales: {
      preOp: ["Harris 髋关节评分", "VAS 疼痛评分", "SF-36 生活质量"],
      intraOp: ["术中假体取出记录", "感染清创记录", "骨缺损分型（Paprosky）"],
      postOp: ["Harris 髋关节评分", "WOMAC", "步态分析"],
    },
    rehabTag: "髋关节翻修康复",
  },
  {
    surgery: "TKA",
    diagnoses: ["原发性单侧膝关节病", "膝关节骨性关节炎", "类风湿性膝关节炎"],
    scales: {
      preOp: ["HSS 膝关节评分", "KSS 膝关节评分", "VAS", "WOMAC"],
      intraOp: ["术中截骨对线记录", "假体型号记录"],
      postOp: ["HSS", "KSS 功能评分", "ROM 关节活动度", "步行能力评估"],
    },
    rehabTag: "膝关节置换康复",
  },
  {
    surgery: "ACLR",
    diagnoses: ["膝关节前十字韧带损伤", "ACL 断裂"],
    scales: {
      preOp: ["IKDC 主观膝评分", "Lysholm 评分", "Tegner 活动等级", "VAS"],
      intraOp: ["移植物类型 / 直径记录", "隧道位置记录"],
      postOp: ["IKDC", "Lysholm", "KOOS", "肌力对称性 LSI", "单腿跳测试"],
    },
    rehabTag: "ACL 重建康复",
  },
  {
    surgery: "THA 翻修 + 骨折内固定",
    diagnoses: ["股骨假体周围骨折", "Vancouver B2/B3 型骨折"],
    scales: {
      preOp: ["Harris", "VAS", "骨折 Vancouver 分型"],
      intraOp: ["内固定类型记录", "假体稳定性评估"],
      postOp: ["Harris", "负重进程记录", "X 线愈合评估"],
    },
    rehabTag: "假体周围骨折康复",
  },
];

/** 根据手术名称模糊匹配规则 */
export function matchRule(surgery: string): SurgeryScaleRule | undefined {
  if (!surgery) return undefined;
  const s = surgery.replace(/\s/g, "");
  return surgeryScaleRules.find((r) => s.includes(r.surgery.replace(/\s/g, "")));
}
