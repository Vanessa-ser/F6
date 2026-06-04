import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';

// IP por defecto (detección previa). Puedes cambiarla o establecer
// `DEV_SERVER_HOST` en `app.json` -> expo.extra.
const HOST = '192.168.1.126';
const ENV_HOST = ((Constants as any)?.expoConfig?.extra?.DEV_SERVER_HOST as string) || undefined;

function extractHostsFromConstants(obj: any): string[] {
  const found = new Set<string>();
  const strRegex = /([a-z0-9.-]+(?:\.[a-z0-9.-]+)*|\d{1,3}(?:\.\d{1,3}){3})(?::(\d{2,5}))?/gi;

  function walk(value: any) {
    if (!value) return;
    if (typeof value === 'string') {
      let m: RegExpExecArray | null;
      while ((m = strRegex.exec(value))) {
        // m[1] is host or IP
        const host = m[1];
        if (host && host !== 'http' && host !== 'https' && host !== 'exp') {
          found.add(host);
        }
      }
    } else if (typeof value === 'object') {
      for (const k of Object.keys(value)) {
        walk(value[k]);
      }
    }
  }

  try {
    walk(obj);
  } catch {}

  return Array.from(found.values());
}
const PORTS = [19001, 19000, 8081];
const API_PORT = 3000; // puerto por defecto de Next.js
const POLL_INTERVAL = 10000; // sondeo cada 10s para reducir logs
const TIMEOUT = 1500;

async function pingUrl(url: string, timeout = TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return { ok: res.ok, status: res.status, url } as const;
  } catch (err) {
    clearTimeout(id);
    return { ok: false, error: String(err), url } as const;
  }
}

async function isDevServerUp(reporter?: (s: string) => void) {
  // Intenta deducir host desde Constants.debuggerHost si está disponible
  const dbg = (Constants as any)?.manifest?.debuggerHost || (Constants as any)?.manifest2?.debuggerHost;
  const hostFromConstants = typeof dbg === 'string' ? dbg.split(':')[0] : null;
  // Construir candidatos a host a partir de varias fuentes: variable en app.json,
  // datos detectados en Constants (manifest, experienceUrl, debuggerHost), y la IP por defecto.
  const extracted = extractHostsFromConstants(Constants);
  const hostCandidates = [ENV_HOST, hostFromConstants, ...extracted, HOST].filter(Boolean) as string[];

  reporter?.(`Candidates: ${hostCandidates.join(', ')}`);
  for (const host of hostCandidates) {
    // Primero intenta el endpoint de health en el backend (Next.js)
    try {
      const resApi = await pingUrl(`http://${host}:${API_PORT}/api/health`);
      reporter?.(`${resApi.url} -> ${resApi.ok ? 'OK' : 'FAIL'}${(resApi as any).status ? ' ' + (resApi as any).status : ''}${(resApi as any).error ? ' ' + (resApi as any).error : ''}`);
      if (resApi.ok) return true;
    } catch (e) {
      reporter?.(`api check error ${String(e)}`);
    }
    for (const p of PORTS) {
      try {
        const resStatus = await pingUrl(`http://${host}:${p}/status`);
        reporter?.(`${resStatus.url} -> ${resStatus.ok ? 'OK' : 'FAIL'}`);
        if (resStatus.ok) return true;
      } catch (e) {
        reporter?.(`status check error ${String(e)}`);
      }
      try {
        const resRoot = await pingUrl(`http://${host}:${p}/`);
        reporter?.(`${resRoot.url} -> ${resRoot.ok ? 'OK' : 'FAIL'}`);
        if (resRoot.ok) return true;
      } catch (e) {
        reporter?.(`root check error ${String(e)}`);
      }
    }
  }
  return false;
}

export default function DevServerWatcher() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [lastLog, setLastLog] = useState<string | null>(null);
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
  const EXTRA = (Constants as any)?.expoConfig?.extra || {};
  const DEBUG = EXTRA.DEV_WATCHER_DEBUG === true || EXTRA.DEV_WATCHER_DEBUG === 'true';

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval>;

    async function check() {
      const logs: string[] = [];
      const ok = await isDevServerUp((s: string) => {
        logs.push(s);
      });
      if (DEBUG && logs.length) logs.forEach(l => console.log('[DevServerWatcher]', l));
      if (mounted) setLastLog(logs.length ? logs[logs.length - 1] : null);
      if (!mounted) return;
      setOnline(ok);
    }

    check();
    intervalId = setInterval(check, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (online === null || online) return null;

  return (
    <View style={styles.banner} pointerEvents="none">
      <Text style={styles.text}>Conexión de desarrollo perdida — servidor detenido</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0,
    left: 0,
    right: 0,
    backgroundColor: '#b00020',
    padding: 8,
    zIndex: 9999,
  },
  text: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  debug: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 8 : 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 6,
    zIndex: 10000,
  },
  debugTitle: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  debugText: { color: '#fff', fontSize: 12 },
});
