import { createSignal, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Toaster, toast } from 'solid-toast';

import { Button } from '@booking/shared-ui';
import { validatePhone } from '@booking/shared-utils';
import { authStore } from '../stores/authStore';
import { 
  ROUTES, 
  ERROR_MESSAGES, 
  VALIDATION_RULES 
} from '../constants';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    mobile: '',
    password: ''
  });
  const [errors, setErrors] = createSignal({});
  const [showPassword, setShowPassword] = createSignal(false);

  onMount(() => {
    toast.dismiss();
  });

  // 如果已登录，重定向到首页
  createEffect(() => {
    if (authStore.isAuthenticated()) {
      navigate(ROUTES.HOME, { replace: true });
    }
  });

  const validateForm = () => {
    const data = formData();
    const newErrors = {};

    if (!data.mobile) {
      newErrors.mobile = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!validatePhone(data.mobile)) {
      newErrors.mobile = ERROR_MESSAGES.INVALID_mobile;
    }

    if (!data.password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (data.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await authStore.login(formData());
    
    if (result.success) {
      toast.success('登录成功！');
      navigate(ROUTES.HOME, { replace: true });
    } else {
      setErrors({ submit: result.error });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors()[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div class={styles.container}>
      <Toaster />
      <div class={styles.loginBox}>
        <div class={styles.header}>
          <h1>登录</h1>
          <p>欢迎回到餐桌预订系统</p>
        </div>

        <form onSubmit={handleSubmit} class={styles.form}>
          <div class={styles.inputGroup}>
            <label for="mobile">手机号</label>
            <input
              id="mobile"
              type="tel"
              placeholder="请输入手机号"
              value={formData().mobile}
              onInput={(e) => handleInputChange('mobile', e.target.value)}
              class={errors().mobile ? styles.inputError : ''}
            />
            {errors().mobile && (
              <span class={styles.errorText}>{errors().mobile}</span>
            )}
          </div>

          <div class={styles.inputGroup}>
            <label for="password">密码</label>
            <div class={styles.passwordInput}>
              <input
                id="password"
                type={showPassword() ? 'text' : 'password'}
                placeholder="请输入密码"
                value={formData().password}
                onInput={(e) => handleInputChange('password', e.target.value)}
                class={errors().password ? styles.inputError : ''}
              />
              <button
                type="button"
                class={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword())}
              >
                {showPassword() ? '隐藏' : '显示'}
              </button>
            </div>
            {errors().password && (
              <span class={styles.errorText}>{errors().password}</span>
            )}
          </div>

          {errors().submit && (
            <div class={styles.submitError}>
              {errors().submit}
            </div>
          )}

          <Button
            type="submit"
            loading={authStore.loading()}
            class={styles.submitButton}
          >
            登录
          </Button>
        </form>

        <div class={styles.footer}>
          <p>
            还没有账号？
            <a href={ROUTES.REGISTER} class={styles.link}>
              立即注册
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
