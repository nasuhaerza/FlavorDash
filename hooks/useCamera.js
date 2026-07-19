/**
 * hooks/useCamera.js
 * Custom hook untuk mengelola kamera expo-camera
 *
 * Menangani: permission request, ref kamera, dan pengambilan foto
 */

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back'); // 'front' | 'back'
  const [photo,  setPhoto]  = useState(null);   // URI foto yang diambil
  const [taking, setTaking] = useState(false);  // loading saat capture

  const cameraRef = useRef(null);

  // ── Ambil foto ──────────────────────────────────────────
  async function takePicture() {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: true, // lebih cepat di Android
      });
      setPhoto(result.uri);
      return result.uri;
    } catch (err) {
      console.warn('Gagal mengambil foto:', err);
      return null;
    } finally {
      setTaking(false);
    }
  }

  // ── Toggle kamera depan/belakang ────────────────────────
  function flipCamera() {
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  }

  // ── Reset foto ──────────────────────────────────────────
  function resetPhoto() {
    setPhoto(null);
  }

  return {
    permission,
    requestPermission,
    cameraRef,
    CameraView,       // export komponen agar bisa dipakai di screen
    facing,
    photo,
    taking,
    takePicture,
    flipCamera,
    resetPhoto,
  };
}
