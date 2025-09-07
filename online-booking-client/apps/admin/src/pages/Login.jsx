import { createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Button } from '@booking/shared-ui';
import { authStore } from '../stores/authStore';
import { 
  ROUTES, 
  ERROR_MESSAGES, 
  VALIDATION_RULES 
} from '../constants';
import styles from './Login.module.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    username: '',
    password: ''
  });
  const [errors, setErrors] = createSignal({});
  const [showPassword, setShowPassword] = createSignal(false);

  // 如果已登录，重定向到仪表盘
  createEffect(() => {
    if (authStore.isAuthenticated()) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  });

  const validateForm = () => {
    const data = formData();
    const newErrors = {};

    if (!data.username) {
      newErrors.username = ERROR_MESSAGES.REQUIRED_FIELD;
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
      navigate(ROUTES.DASHBOARD, { replace: true });
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
      <div class={styles.loginBox}>
        <div class={styles.header}>
          <div class={styles.logo}>
            <span class={styles.logoIcon}>🏪</span>
            <h1>管理后台</h1>
          </div>
          <p>餐桌预订系统管理端</p>
        </div>

        <form onSubmit={handleSubmit} class={styles.form}>
          <div class={styles.inputGroup}>
            <label for="username">用户名</label>
            <input
              id="username"
              type="text"
              placeholder="请输入管理员用户名"
              value={formData().username}
              onInput={(e) => handleInputChange('username', e.target.value)}
              class={errors().username ? styles.inputError : ''}
            />
            {errors().username && (
              <span class={styles.errorText}>{errors().username}</span>
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
          <p class={styles.copyright}>
            © 2025 餐桌预订系统 管理端
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
