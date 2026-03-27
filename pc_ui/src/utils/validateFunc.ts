/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:06:21
* @Last Modified by:   兰舰
* @Last Modified time: 2024-11-15 11:06:21
* @Copyright aPaaS-front-team. All rights reserved.
*/
// 为了保证必填和非必填的通用性，使用以下校验规则，只考虑有值的校验，对于必填的校验请先在rules填写必填属性
export const validatePass = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else {
    if (value.length < 8) {
      callback(new Error("密码长度不能少于8位"));
    } else {
      callback();
    }
  }
};

export const validatePhone = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else if (value.includes('**')) {
    callback()
  }  else {
    const reg =
      /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;

    if (!reg.test(value)) {
      callback(new Error("请输入正确的手机号码"));
    } else {
      callback();
    }
  }
};

// 验证联系电话号码  手机号或座机
export const validatePhoneOrMobile = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else if (value.includes('**')) {
    callback()
  }  else {
    const reg =
      /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    const tel = /^0\d{2,3}-?\d{7,8}$/;
    if (reg.test(value) || tel.test(value)) {
      callback();
    } else {
      callback(new Error("请输入正确的电话号码"));
    }
  }
};

export const validateIDCard = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else if (value.includes('**')) {
    callback()
  }  else {
    const reg =
      /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!reg.test(value)) {
      callback(new Error("请输入正确的身份证号码"));
    } else {
      callback();
    }
  }
};

export const validateEmail = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else {
    const reg = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    if (!reg.test(value)) {
      callback(new Error("请输入正确的邮箱"));
    } else {
      callback();
    }
  }
};

// 银行卡校验
export const validateBankCard = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else if (value.includes('**')) {
    callback()
  }  else {
    const reg = /^\d{16,19}$/;
    if (!reg.test(value)) {
      callback(new Error("请输入正确的银行卡号"));
    } else {
      callback();
    }
  }
};

// 结算账号校验
export const validateAccountCard = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else {
    const reg = /^\d{16,22}$/;
    if (!reg.test(value)) {
      callback(new Error("请输入正确的账户账号"));
    } else {
      callback();
    }
  }
};

// 只能是字母的数字 或者符号的校验 (不能为中文)
export const validateLetterNumber = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else {
    const reg = /[\u4E00-\u9FA5]/;
    console.log('都得动---,', reg.test(value))
    if (reg.test(value)) {
      callback(new Error("请输入正确的格式"));
    } else {
      callback();
    }
  }
};

// 只能是数字或者字母的校验
export const validateNumberLetter = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else {
    const reg = /^[a-zA-Z0-9]+$/;
    if (!reg.test(value)) {
      callback(new Error("请输入正确的格式"));
    } else {
      callback();
    }
  }
};

// 只能是数字
export const validateNumber = (rule, value, callback) => {
  if (value === "") {
    callback();
  } else {
    const reg = /^\d*$/;
    if (!reg.test(value)) {
      callback(new Error("请输入正确的格式"));
    } else {
      callback();
    }
  }
};
