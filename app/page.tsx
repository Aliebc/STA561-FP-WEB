"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import chinaCities from "@/data/china_cities.json";

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ascend-form');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [errors, setErrors] = useState({});

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  const startAssessment = () => {
    setShowForm(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ascend-form', JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  

  const validateForm = () => {
    const newErrors = {};
    ["self", "father", "mother"].forEach(role => {
      const newErrors: { [key: string]: boolean } = {};
      const data = formData[role] || {};
      if (!data.province || !data.city) newErrors[`${role}-city`] = true;
      if (!data.gender) newErrors[`${role}-gender`] = true;
      if (role !== 'self' && !data.income) newErrors[`${role}-income`] = true;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [result, setResult] = useState(null);

  const handleRetake = () => {
      //setFormData({});
      setResult(null);
      setShowForm(true);
    };
  

  const handleSubmit = async () => {
    if (false) {
      alert(language === "en" ? "Please complete required fields." : "请填写所有必填项。");
      return;
    }
    const preparedData: { [key: string]: any } = {};
    Object.keys(formData).forEach(role => {
      const d = formData[role];
      preparedData[role] = {
        ...d,
        city: `${chinaCities[d.province]?.cities[d.city]?.id || ''}`
      };
    });
    setSubmitting(true); // 按下后设置为提交中
    try {
      const response = await fetch('/api/proxy-eva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedData)
      });
      if (response.ok) {
        const data = await response.json();
        setShowForm(false);
        setResult(data.data);
      } else {
        alert(language === "en" ? "Submission Failed." : "提交失败。");
      }
    } catch (error) {
      console.error(error);
      alert(language === "en" ? "Network Error." : "网络错误。");
    } finally {
      setSubmitting(false); // 不管成功失败，最后都要恢复
    }
  };
  

  const getRoleTitle = (role) => {
    if (language === "en") {
      return role === "self" ? "Personal Information" : role === "father" ? "Father's Information" : "Mother's Information";
    } else {
      return role === "self" ? "个人信息" : role === "father" ? "父亲信息" : "母亲信息";
    }
  };

  const educationOptions = [
    { en: "No Formal Education", zh: "没上过学", id: 1 },
    { en: "Primary School", zh: "小学", id: 2 },
    { en: "Middle School", zh: "初中", id: 3 },
    { en: "High School", zh: "高中", id: 4 },
    { en: "Vocational School", zh: "中专/职高", id: 5 },
    { en: "Junior College", zh: "大专/高职", id: 6 },
    { en: "Bachelor", zh: "本科", id: 7 },
    { en: "Master", zh: "硕士研究生", id: 8 },
    { en: "PhD", zh: "博士研究生", id: 9 },
  ];

  const provinces = Object.keys(chinaCities);

  const partyOptions = [
    { value: "yes", label: { en: "Yes", zh: "是" } },
    { value: "no", label: { en: "No", zh: "否" } },
  ];

  const insuranceOptions = [
    { value: "1", label: { en: "Government/Institution Pension", zh: "政府、事业单位退休金" } },
    { value: "2", label: { en: "Urban Employee Basic Pension", zh: "城镇职工基本养老保险金（城职保）" } },
    { value: "3", label: { en: "New Rural Social Pension", zh: "新型农村社会养老保险金（新农保）" } },
    { value: "4", label: { en: "Urban Resident Social Pension", zh: "城镇居民社会养老保险金（城居保）" } },
    { value: "5", label: { en: "Unified Urban-Rural Resident Pension", zh: "城乡统一居民社会养老保险金" } },
  ];

  const workOptions = [
    { value: "1", label: { en: "Government/Institution", zh: "机关团体/事业单位" } },
    { value: "2", label: { en: "State-owned Enterprise", zh: "国有及国有控股企业" } },
    { value: "3", label: { en: "Collective Enterprise", zh: "集体企业" } },
    { value: "4", label: { en: "Self-employed", zh: "个体工商户" } },
    { value: "5", label: { en: "Private Enterprise", zh: "私营企业" } },
    { value: "6", label: { en: "Foreign/Joint Venture", zh: "外商、港澳台投资企业" } },
    { value: "7", label: { en: "Other", zh: "其他类型单位" } },
    { value: "8", label: { en: "Farming Land", zh: "耕作经营承包土地" } },
    { value: "7777", label: { en: "Other", zh: "其他" } },
  ];

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="flex justify-end">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button onClick={toggleLanguage} className="m-4">
            {language === "en" ? "中文" : "English"}
          </Button>
        </motion.div>
      </div>

      {!showForm && !result && (
        <motion.div initial={{ y: "-100vh" }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 80 }} className="mt-6 max-w-5xl mx-auto">
          <Card className="shadow-2xl rounded-2xl">
            <CardContent className="p-10">
              <h1 className="text-4xl font-extrabold mb-6 text-center">{language === "en" ? "Ascend: Talent Potential Assessment" : "Ascend: 评估潜力"}</h1>
              <p className="mb-6 text-lg text-gray-700">
                {language === "en"
                  ? "We trained a machine learning model trained on the China Household Finance Survey (CHFS), using data from over 40,000 households and 120,000 individuals across mainland China. It predicts the probability of a young person entering the top 10% income bracket in the future."
                  : "本评估依托于中国家庭金融调查（CHFS）大数据，基于中国大陆地区超过4万户、12万人的样本，利用机器学习模型预测一个年轻人未来跻身全国收入前10%的概率。"}
              </p>
              <Button onClick={startAssessment} className="w-full mt-4">
                {language === "en" ? "Start Assessment" : "开始评估"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}


      {showForm &&!result && (
        <motion.div initial={{ y: "100vh" }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 80 }} className="mt-6 max-w-4xl mx-auto">
          <Card className="shadow-2xl rounded-2xl">
            <CardContent className="p-10">
              {['self', 'father', 'mother'].map(role => (
                <div key={role} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">{getRoleTitle(role)}</h2>
                  <div className="space-y-4">
                    {true && (
                      <div>
                        <label className="block font-semibold">1. {language === "en" ? "Date of Birth (Year) *" : "出生年份 *"}</label>
                        <input
                          type="number"
                          className={`w-full p-2 border rounded ${errors[`${role}-year`] ? 'border-red-500' : ''}`}
                          value={formData[role]?.year || ""}
                          onChange={(e) => handleChange(role, "year", e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block font-semibold">2. {language === "en" ? "Registered Province and City *" : "户口所在地 *"}</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={formData[role]?.province || ""}
                        onChange={(e) => handleChange(role, "province", e.target.value)}
                        required
                      >
                        <option value="">{language === "en" ? "Select Province" : "选择省份"}</option>
                        {provinces.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                      <select
                        className={`w-full p-2 border rounded ${errors[`${role}-city`] ? 'border-red-500' : ''}`}
                        value={formData[role]?.city || ""}
                        onChange={(e) => handleChange(role, "city", e.target.value)}
                        required
                      >
                        <option value="">{language === "en" ? "Select City *" : "选择地级市 *"}</option>
                        {formData[role]?.province &&
                          Object.keys(chinaCities[formData[role].province]?.cities || {}).map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold">3. {language === "en" ? "Urbanization Status *" : "户口类型是否为农转非 *"}</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={formData[role]?.urbanization || "no"}
                        onChange={(e) => handleChange(role, "urbanization", e.target.value)}
                        required
                      >
                        <option value="no">{language === "en" ? "Non-urbanized" : "否"}</option>
                        <option value="yes">{language === "en" ? "Urbanized" : "是"}</option>
                      </select>
                    </div>
                    {role == 'self' && (
                    <div>
                      <label className="block font-semibold">4. {language === "en" ? "Gender *" : "性别 *"}</label>
                      <select
                        className={`w-full p-2 border rounded ${errors[`${role}-gender`] ? 'border-red-500' : ''}`}
                        value={formData[role]?.gender || ""}
                        onChange={(e) => handleChange(role, "gender", e.target.value)}
                        required
                      >
                        <option value="">{language === "en" ? "Select Gender *" : "选择性别 *"}</option>
                        <option value="male">{language === "en" ? "Male" : "男"}</option>
                        <option value="female">{language === "en" ? "Female" : "女"}</option>
                        <option value="other">{language === "en" ? "Other" : "其他"}</option>
                      </select>
                    </div>
                    )}
                    {role !== 'self' && (
                      <div>
                        <label className="block font-semibold">5. {language === "en" ? "Average Monthly Income (RMB) *" : "平均月收入（人民币）*"}</label>
                        <input
                          type="number"
                          className={`w-full p-2 border rounded ${errors[`${role}-income`] ? 'border-red-500' : ''}`}
                          value={formData[role]?.income || ""}
                          onChange={(e) => handleChange(role, "income", e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block font-semibold">6. {language === "en" ? "Education Level" : "文化程度"}</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={formData[role]?.education || ""}
                        onChange={(e) => handleChange(role, "education", e.target.value)}
                      >
                        <option value="">{language === "en" ? "Select Education Level" : "选择文化程度"}</option>
                        {educationOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{language === "en" ? opt.en : opt.zh}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold">7. {language === "en" ? "Overseas Study Experience" : "是否有境外留学经历并取得过境外学位"}</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={formData[role]?.overseas || "no"}
                        onChange={(e) => handleChange(role, "overseas", e.target.value)}
                      >
                        <option value="no">{language === "en" ? "No Overseas Degree" : "无境外学位"}</option>
                        <option value="yes">{language === "en" ? "With Overseas Degree" : "有境外学位"}</option>
                      </select>
                    </div>
                    

                    <div>
                      <label className="block font-semibold">8. {language === 'en' ? 'Are you a CPC member or probationary member?' : '是否为中共党员或中共预备党员？'}</label>
                      <select className="w-full p-2 border rounded" value={formData[role]?.party || ""} onChange={(e) => handleChange(role, "party", e.target.value)}>
                        <option value="">{language === 'en' ? 'Select' : '请选择'}</option>
                        {partyOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label[language]}</option>))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold">9. {language === 'en' ? 'Number of brothers' : '兄弟个数'}</label>
                      <input type="number" className="w-full p-2 border rounded" value={formData[role]?.brothers || ""} onChange={(e) => handleChange(role, "brothers", e.target.value)} min="0" />
                    </div>

                    <div>
                      <label className="block font-semibold">10. {language === 'en' ? 'Number of sisters' : '姐妹个数'}</label>
                      <input type="number" className="w-full p-2 border rounded" value={formData[role]?.sisters || ""} onChange={(e) => handleChange(role, "sisters", e.target.value)} min="0" />
                    </div>

                    {role !== 'self' && (
                      <>
                        <div>
                          <label className="block font-semibold">11. {language === 'en' ? 'Type of Social Pension Insurance' : '参加的是哪种社会养老保险？'}</label>
                          <select className="w-full p-2 border rounded" value={formData[role]?.pension || ""} onChange={(e) => handleChange(role, "pension", e.target.value)}>
                            <option value="">{language === 'en' ? 'Select' : '请选择'}</option>
                            {insuranceOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label[language]}</option>))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold">13. {language === 'en' ? 'Type of Work Unit' : '工作单位类型'}</label>
                          <select className="w-full p-2 border rounded" value={formData[role]?.workUnit || ""} onChange={(e) => handleChange(role, "workUnit", e.target.value)}>
                            <option value="">{language === 'en' ? 'Select' : '请选择'}</option>
                            {workOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label[language]}</option>))}
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block font-semibold">12. {language === 'en' ? 'Has your household registration moved across districts/counties?' : '是否跨区/县转移过户口？'}</label>
                      <select className="w-full p-2 border rounded" value={formData[role]?.hukouTransfer || ""} onChange={(e) => handleChange(role, "hukouTransfer", e.target.value)}>
                        <option value="">{language === 'en' ? 'Select' : '请选择'}</option>
                        {partyOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label[language]}</option>))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold">
                        13. {language === 'en' ? 'What commuting methods are used for work? (Multiple choices allowed)' : '上班采用的交通工具？（可多选）'}
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          { value: "1", label: { en: "Surface Public Transport (including bus)", zh: "路面公共交通（包括公交）" } },
                          { value: "2", label: { en: "Subway or Metro", zh: "轨道交通（包括地铁）" } },
                          { value: "3", label: { en: "Official Vehicle (including shuttle bus)", zh: "公务车（包括班车）" } },
                          { value: "4", label: { en: "Private Car", zh: "私家车" } },
                          { value: "5", label: { en: "Taxi (including Didi, Uber)", zh: "打车（包括出租车、滴滴打车、优步等）" } },
                          { value: "6", label: { en: "Electric Bike / Motorcycle", zh: "电动车或摩托车" } },
                          { value: "7", label: { en: "Bicycle", zh: "自行车" } },
                          { value: "8", label: { en: "Walking", zh: "步行" } }
                        ].map(opt => (
                          <label key={opt.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={opt.value}
                              checked={formData[role]?.commute?.includes(opt.value) || false}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFormData(prev => {
                                  const prevCommute = prev[role]?.commute || [];
                                  const newCommute = e.target.checked
                                    ? [...prevCommute, value]
                                    : prevCommute.filter(v => v !== value);
                                  return {
                                    ...prev,
                                    [role]: {
                                      ...prev[role],
                                      commute: newCommute,
                                    }
                                  };
                                });
                              }}
                              className="accent-blue-500"
                            />
                            <span>{opt.label[language]}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                
              ))}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
                  {submitting ? (language === "en" ? "Model Training..." : "模型训练中...") : (language === "en" ? "Submit" : "提交")}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}


      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="mt-10 max-w-3xl mx-auto">
          <Card className="shadow-2xl rounded-2xl bg-white">
            <CardContent className="p-10 flex flex-col items-center">
              <h1 className="text-4xl font-extrabold mb-6 text-center">
                {result.predicted_class === 1
                  ? (language === 'en' ? "🎉 Congratulations, High Potential!" : "🎉 恭喜，有很大潜力！")
                  : (language === 'en' ? "Keep Going!" : "继续努力！")}
              </h1>
              <p className="text-6xl font-bold text-blue-600 mb-4">
                {`${(result.predicted_probabilities[1] * 100).toFixed(2)}%`}
              </p>
              <p className="text-gray-600 text-center mt-4">
                {language === 'en'
                  ? "This represents the probability of entering the top 10% income group in the future."
                  : "这是模型预测您未来跻身全国收入前10%人群的概率。"}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8 w-full">
                <Button onClick={handleRetake} className="w-full">
                  {language === "en" ? "Retake Assessment" : "重新测试"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
    
  );
}
