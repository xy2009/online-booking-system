import { splitProps } from 'solid-js';
import styles from './Button.module.css';

export function Button(props) {
  const [local, others] = splitProps(props, [
    'children',
    'variant',
    'size',
    'disabled',
    'loading',
    'class'
  ]);

  const buttonClass = () => {
    const classes = [styles.button];
    
    if (local.variant) {
      classes.push(styles[local.variant]);
    } else {
      classes.push(styles.primary);
    }
    
    if (local.size) {
      classes.push(styles[local.size]);
    } else {
      classes.push(styles.medium);
    }
    
    if (local.disabled || local.loading) {
      classes.push(styles.disabled);
    }
    
    if (local.class) {
      classes.push(local.class);
    }
    
    return classes.join(' ');
  };

  return (
    <button
      class={buttonClass()}
      disabled={local.disabled || local.loading}
      {...others}
    >
      {local.loading && (
        <span class={styles.spinner}></span>
      )}
      <span class={local.loading ? styles.hidden : ''}>
        {local.children}
      </span>
    </button>
  );
}
