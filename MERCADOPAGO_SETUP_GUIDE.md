# 🚀 Guía de Configuración de MercadoPago para Casa Piñón

## 📋 Resumen
Esta guía te ayudará a configurar MercadoPago como método de pago principal para Casa Piñón Ebanistería.

## ✅ Ventajas de MercadoPago en Colombia

### 🎯 **Métodos de Pago Soportados:**
- ✅ **Tarjetas de Crédito/Débito** (Visa, Mastercard, American Express)
- ✅ **PSE** (Pagos Seguros en Línea)
- ✅ **Efectivo** (Efecty, Baloto, Gana)
- ✅ **Billeteras Digitales** (Nequi, DaviPlata)
- ✅ **Transferencias Bancarias** (Bancolombia, Banco de Bogotá, etc.)

### 💰 **Costos:**
- **Tarjetas de Crédito:** 3.5% + IVA
- **Tarjetas de Débito:** 2.5% + IVA
- **PSE:** 2.5% + IVA
- **Efectivo:** 3.5% + IVA
- **Sin costo mensual**

## 🔧 Configuración Paso a Paso

### 1. Crear Cuenta en MercadoPago

1. **Ve a:** https://www.mercadopago.com.co/
2. **Haz clic en:** "Registrarse"
3. **Completa el formulario** con los datos de Casa Piñón:
   - Nombre: Casa Piñón Ebanistería
   - Email: [tu-email@casapinon.com]
   - Teléfono: [tu-número]
   - Tipo de cuenta: **Empresa**

### 2. Verificar la Cuenta

1. **Sube documentos:**
   - Cédula de ciudadanía o NIT
   - Comprobante de domicilio
   - Certificado bancario

2. **Espera la aprobación** (24-48 horas)

### 3. Obtener las Credenciales

1. **Ve a:** https://www.mercadopago.com.co/developers/panel/credentials
2. **Copia las credenciales:**
   - **Public Key** (para el frontend)
   - **Access Token** (para el backend)

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# MercadoPago Credentials
MERCADOPAGO_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012
MERCADOPAGO_ACCESS_TOKEN=TEST-12345678-1234-1234-1234-123456789012

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

### 5. Configurar Webhooks

1. **Ve a:** https://www.mercadopago.com.co/developers/panel/notifications
2. **Agrega la URL del webhook:**
   ```
   http://tu-dominio.com/api/mercadopago/webhook
   ```
3. **Selecciona los eventos:**
   - `payment.created`
   - `payment.updated`
   - `payment.cancelled`

## 🚀 Probar la Integración

### 1. Iniciar los Servidores

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server && node mercadopago-api.js
```

### 2. Probar con Tarjetas de Prueba

**Tarjetas de Crédito:**
- **Visa:** 4509 9535 6623 3704
- **Mastercard:** 5031 4332 1540 6351
- **American Express:** 3711 8030 3257 522

**Datos de Prueba:**
- **CVV:** 123
- **Fecha:** Cualquier fecha futura
- **Nombre:** APRO (para pagos aprobados) o OTHE (para otros resultados)

### 3. Probar PSE

1. Selecciona "PSE" como método de pago
2. Elige cualquier banco
3. Usa cualquier documento de identidad

## 📊 Monitoreo y Reportes

### 1. Panel de MercadoPago

**Accede a:** https://www.mercadopago.com.co/activities
- Ver transacciones en tiempo real
- Descargar reportes
- Configurar alertas

### 2. Webhooks

Los webhooks te notificarán automáticamente sobre:
- Pagos aprobados
- Pagos rechazados
- Pagos pendientes
- Cambios de estado

## 🔒 Seguridad

### ✅ **Medidas Implementadas:**
- Encriptación SSL de 256 bits
- Validación de webhooks
- Verificación de firmas
- Manejo seguro de credenciales

### 🛡️ **Buenas Prácticas:**
- Nunca expongas el Access Token en el frontend
- Usa HTTPS en producción
- Valida todas las transacciones
- Mantén logs de seguridad

## 📱 Personalización

### Colores de MercadoPago
Los colores se pueden personalizar en el componente:

```javascript
theme: {
  elementsColor: '#8B4513',  // Color principal (marrón)
  headerColor: '#8B4513'     // Color del header
}
```

### Textos Personalizados
Puedes modificar los textos en `src/components/MercadoPagoPayment.tsx`

## 🚨 Solución de Problemas

### Error: "Invalid credentials"
- Verifica que las credenciales sean correctas
- Asegúrate de usar credenciales de producción, no de prueba

### Error: "Preference not found"
- Verifica que el preferenceId sea válido
- Revisa los logs del backend

### Error: "Webhook not received"
- Verifica que la URL del webhook sea accesible
- Revisa la configuración en el panel de MercadoPago

## 📞 Soporte

### MercadoPago Soporte
- **Email:** soporte@mercadopago.com.co
- **Teléfono:** 01 8000 123 456
- **Chat:** Disponible en el panel de MercadoPago

### Documentación Oficial
- **API Docs:** https://www.mercadopago.com.co/developers/es/docs
- **SDK Docs:** https://github.com/mercadopago/sdk-nodejs

## 🎉 ¡Listo!

Una vez completada la configuración, Casa Piñón podrá:
- ✅ Aceptar pagos con tarjetas
- ✅ Procesar pagos PSE
- ✅ Recibir pagos en efectivo
- ✅ Manejar múltiples métodos de pago
- ✅ Recibir notificaciones automáticas
- ✅ Generar reportes detallados

**¡MercadoPago es la solución más completa y confiable para pagos en Colombia!**


