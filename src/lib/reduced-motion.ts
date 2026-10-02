/**
 * La marca quiere que las animaciones se vean en todos los dispositivos
 * (muchos iPhone tienen "Reducir movimiento" o ahorro de energía activos).
 * Las animaciones del sitio son suaves, así que no se apagan.
 */
export function useReducedMotion() {
  return false;
}
