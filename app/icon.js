import { ImageResponse } from 'next/og';

export const size = {
  width: 96,
  height: 96,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '96px',
          height: '96px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFF7E9',
          borderRadius: '24px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', left: 16, top: 45, width: 31, height: 31, borderRadius: 10, background: '#FF765C' }} />
        <div style={{ position: 'absolute', left: 39, top: 17, width: 31, height: 31, borderRadius: 10, background: '#FFD34F' }} />
        <div style={{ position: 'absolute', left: 47, top: 47, width: 32, height: 30, borderRadius: 10, background: '#4C8DFF' }} />
        <div style={{ position: 'absolute', left: 29, top: 28, width: 29, height: 29, borderRadius: 10, background: '#5CC78A' }} />
        <div style={{ position: 'absolute', left: 25, top: 55, width: 34, height: 7, borderRadius: 4, background: '#18233A', transform: 'rotate(-45deg)' }} />
        <div style={{ position: 'absolute', left: 49, top: 29, width: 7, height: 16, borderRadius: 4, background: '#18233A', transform: 'rotate(-45deg)' }} />
        <div style={{ position: 'absolute', left: 49, top: 29, width: 15, height: 7, borderRadius: 4, background: '#18233A', transform: 'rotate(0deg)' }} />
        <div style={{ position: 'absolute', left: 70, top: 19, width: 8, height: 8, borderRadius: 999, background: '#FF765C' }} />
      </div>
    ),
    { ...size }
  );
}
