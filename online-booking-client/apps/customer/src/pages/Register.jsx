import { createSignal, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Toaster, toast } from 'solid-toast';

import { Button } from '@booking/shared-ui';
import { validatePhone } from '@booking/shared-utils';
import { authStore } from '../stores/authStore';
import styles from './Register.module.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = createSignal({});
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);

  onMount(() => {
    toast.dismiss();
  });

  // 如果已登录，重定向到首页
  createEffect(() => {
    if (authStore.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  });

  const validateForm = () => {
    const data = formData();
    const newErrors = {};

    if (!data.name) {
      newErrors.name = '请输入姓名';
    } else if (data.name.length < 2) {
      newErrors.name = '姓名至少2个字符';
    }

    if (!data.mobile) {
      newErrors.mobile = '请输入手机号';
    } else if (!validatePhone(data.mobile)) {
      newErrors.mobile = '请输入正确的手机号格式';
    }

    if (!data.password) {
      newErrors.password = '请输入密码';
    } else if (data.password.length < 6) {
      newErrors.password = '密码至少6位';
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...registerData } = formData();
    const result = await authStore.register(registerData);
    
    if (result.success) {
      // 注册成功，显示成功消息并跳转到登录页
      // alert('注册成功！已自动登录');
      toast.success('注册成功！已自动登录');
      
        // navigate('/login');
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
      <div class={styles.registerBox}>
        <div class={styles.header}>
          <h1>注册</h1>
          <p>创建您的餐桌预订账号</p>
        </div>

        <form onSubmit={handleSubmit} class={styles.form}>
          <div class={styles.inputGroup}>
            <label for="name">姓名</label>
            <input
              id="name"
              type="text"
              placeholder="请输入您的姓名"
              value={formData().name}
              onInput={(e) => handleInputChange('name', e.target.value)}
              class={errors().name ? styles.inputError : ''}
            />
            {errors().name && (
              <span class={styles.errorText}>{errors().name}</span>
            )}
          </div>

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
                placeholder="请输入密码（至少6位）"
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

          <div class={styles.inputGroup}>
            <label for="confirmPassword">确认密码</label>
            <div class={styles.passwordInput}>
              <input
                id="confirmPassword"
                type={showConfirmPassword() ? 'text' : 'password'}
                placeholder="请再次输入密码"
                value={formData().confirmPassword}
                onInput={(e) => handleInputChange('confirmPassword', e.target.value)}
                class={errors().confirmPassword ? styles.inputError : ''}
              />
              <button
                type="button"
                class={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword())}
              >
                {showConfirmPassword() ? '隐藏' : '显示'}
              </button>
            </div>
            {errors().confirmPassword && (
              <span class={styles.errorText}>{errors().confirmPassword}</span>
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
            注册
          </Button>
        </form>

        <div class={styles.footer}>
          <p>
            已有账号？
            <a href="/login" class={styles.link}>
              立即登录
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
