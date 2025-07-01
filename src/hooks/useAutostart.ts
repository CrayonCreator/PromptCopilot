import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useAutostart() {
  const [isAutostart, setIsAutostart] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 获取当前自启动状态
    const getAutostartStatus = async () => {
      try {
        const status = await invoke<boolean>('get_autostart_status');
        setIsAutostart(status);
      } catch (error) {
        console.error('Failed to get autostart status:', error);
      } finally {
        setLoading(false);
      }
    };

    getAutostartStatus();
  }, []);

  const toggleAutostart = async () => {
    try {
      setLoading(true);
      const newStatus = !isAutostart;
      await invoke('set_autostart', { enable: newStatus });
      setIsAutostart(newStatus);
    } catch (error) {
      console.error('Failed to toggle autostart:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAutostart,
    toggleAutostart,
    loading
  };
}
