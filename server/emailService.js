const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
    }
  });
};

// Email templates
const createOrderConfirmationEmail = (order, customerInfo) => {
  const itemsList = order.items.map(item => 
    `• ${item.name} - ${new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(item.price)}`
  ).join('\n');

  return {
    subject: `Confirmación de Pedido #${order.orderNumber} - Casa Piñón Ebanistería`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B4513; margin: 0;">Casa Piñón Ebanistería</h1>
          <p style="color: #666; margin: 5px 0;">Artesanía en madera de piñón</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">¡Gracias por tu pedido!</h2>
          <p>Hola ${customerInfo.name},</p>
          <p>Hemos recibido tu pedido y estamos procesándolo. Aquí están los detalles:</p>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Pedido</h3>
          <p><strong>Número de Pedido:</strong> ${order.orderNumber}</p>
          <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
          <p><strong>Estado del Pago:</strong> 
            <span style="color: ${order.paymentStatus === 'paid' ? '#28a745' : order.paymentStatus === 'pending' ? '#ffc107' : '#dc3545'}; font-weight: bold;">
              ${order.paymentStatus === 'paid' ? 'Pagado' : order.paymentStatus === 'pending' ? 'Pendiente' : 'Fallido'}
            </span>
          </p>
          
          <h4 style="color: #333; margin-top: 20px;">Productos:</h4>
          <div style="margin-left: 20px;">
            ${itemsList}
          </div>
          
          <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px;">
            <p style="text-align: right; font-size: 18px; font-weight: bold;">
              <strong>Total:</strong> ${new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
              }).format(order.total)}
            </p>
          </div>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Información de Entrega</h3>
          <p><strong>Nombre:</strong> ${customerInfo.name}</p>
          <p><strong>Email:</strong> ${customerInfo.email}</p>
          <p><strong>Teléfono:</strong> ${customerInfo.phone}</p>
          <p><strong>Dirección:</strong> ${customerInfo.address}</p>
          <p><strong>Zona de Envío:</strong> ${order.shippingZone}</p>
          <p><strong>Entrega Estimada:</strong> ${order.estimatedDelivery}</p>
        </div>

        ${order.paymentStatus === 'pending' ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Pago Pendiente</h4>
            <p style="color: #856404; margin-bottom: 0;">
              Tu pago está siendo procesado. Te enviaremos una confirmación por email 
              tan pronto como se complete el pago.
            </p>
          </div>
        ` : ''}

        <div style="background-color: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h4 style="color: #155724; margin-top: 0;">📞 Contacto</h4>
          <p style="color: #155724; margin-bottom: 5px;">
            Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:
          </p>
          <p style="color: #155724; margin-bottom: 0;">
            <strong>WhatsApp:</strong> +57 300 123 4567<br>
            <strong>Email:</strong> info@casapinon.com
          </p>
        </div>

        <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          <p>© 2024 Casa Piñón Ebanistería. Todos los derechos reservados.</p>
        </div>
      </div>
    `
  };
};

const createPaymentStatusEmail = (order, customerInfo, paymentDetails, paymentStatus) => {
  const itemsList = order.items.map(item => 
    `• ${item.name} - ${new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(item.price)}`
  ).join('\n');

  // Email content based on payment status
  const getStatusContent = () => {
    switch (paymentStatus) {
      case 'approved':
        return {
          title: '✅ ¡Pago Confirmado!',
          subtitle: '¡Excelente noticia!',
          message: 'Tu pago ha sido confirmado exitosamente. Tu pedido está siendo preparado.',
          statusColor: '#28a745',
          statusText: 'Pagado',
          bgColor: '#d4edda',
          textColor: '#155724',
          nextSteps: 'Nuestro equipo de artesanos comenzará a trabajar en tu pedido. Te mantendremos informado sobre el progreso de la fabricación y envío.'
        };
      case 'pending':
        return {
          title: '⏳ Pago Pendiente',
          subtitle: 'Tu pago está siendo procesado',
          message: 'Hemos recibido tu pago y está siendo procesado por tu banco. Te notificaremos cuando se confirme.',
          statusColor: '#ffc107',
          statusText: 'Pendiente',
          bgColor: '#fff3cd',
          textColor: '#856404',
          nextSteps: 'El procesamiento puede tomar de 5 a 15 minutos. No es necesario que hagas nada más.'
        };
      case 'rejected':
      case 'cancelled':
        return {
          title: '❌ Pago Rechazado',
          subtitle: 'Tu pago no pudo ser procesado',
          message: 'Lamentablemente, tu pago no pudo ser procesado. Puedes intentar nuevamente con otro método de pago.',
          statusColor: '#dc3545',
          statusText: 'Rechazado',
          bgColor: '#f8d7da',
          textColor: '#721c24',
          nextSteps: 'Puedes intentar el pago nuevamente visitando tu pedido en nuestra tienda.'
        };
      default:
        return {
          title: '📋 Actualización de Pago',
          subtitle: 'Estado de tu pago actualizado',
          message: 'El estado de tu pago ha sido actualizado.',
          statusColor: '#6c757d',
          statusText: paymentStatus,
          bgColor: '#e2e3e5',
          textColor: '#383d41',
          nextSteps: 'Para más información, contacta nuestro equipo de soporte.'
        };
    }
  };

  const statusContent = getStatusContent();

  return {
    subject: `${statusContent.title} Pedido #${order.orderNumber} - Casa Piñón Ebanistería`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: ${statusContent.statusColor}; margin: 0;">${statusContent.title}</h1>
          <p style="color: #666; margin: 5px 0;">Casa Piñón Ebanistería</p>
        </div>
        
        <div style="background-color: ${statusContent.bgColor}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: ${statusContent.textColor}; margin-top: 0;">${statusContent.subtitle}</h2>
          <p style="color: ${statusContent.textColor};">Hola ${customerInfo.name},</p>
          <p style="color: ${statusContent.textColor};">${statusContent.message}</p>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Pedido</h3>
          <p><strong>Número de Pedido:</strong> ${order.orderNumber}</p>
          <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
          <p><strong>Estado del Pago:</strong> 
            <span style="color: ${statusContent.statusColor}; font-weight: bold;">${statusContent.statusText}</span>
          </p>
          
          <h4 style="color: #333; margin-top: 20px;">Productos:</h4>
          <div style="margin-left: 20px;">
            ${itemsList}
          </div>
          
          <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px;">
            <p style="text-align: right; font-size: 18px; font-weight: bold;">
              <strong>Total:</strong> ${new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
              }).format(order.total)}
            </p>
          </div>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Pago</h3>
          <p><strong>ID de Pago:</strong> ${paymentDetails.id}</p>
          <p><strong>Método de Pago:</strong> ${paymentDetails.payment_method_id}</p>
          <p><strong>Fecha de Pago:</strong> ${new Date(paymentDetails.date_approved || paymentDetails.date_created).toLocaleDateString('es-CO')}</p>
          <p><strong>Monto:</strong> ${new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          }).format(paymentDetails.transaction_amount)}</p>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Información de Entrega</h3>
          <p><strong>Nombre:</strong> ${customerInfo.name}</p>
          <p><strong>Email:</strong> ${customerInfo.email}</p>
          <p><strong>Teléfono:</strong> ${customerInfo.phone}</p>
          <p><strong>Dirección:</strong> ${customerInfo.address}</p>
          <p><strong>Zona de Envío:</strong> ${order.shippingZone}</p>
          <p><strong>Entrega Estimada:</strong> ${order.estimatedDelivery}</p>
        </div>

        <div style="background-color: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h4 style="color: #155724; margin-top: 0;">📦 Próximos Pasos</h4>
          <p style="color: #155724; margin-bottom: 0;">
            ${statusContent.nextSteps}
          </p>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h4 style="color: #856404; margin-top: 0;">📞 Contacto</h4>
          <p style="color: #856404; margin-bottom: 5px;">
            Si tienes alguna pregunta sobre tu pedido:
          </p>
          <p style="color: #856404; margin-bottom: 0;">
            <strong>WhatsApp:</strong> +57 300 123 4567<br>
            <strong>Email:</strong> info@casapinon.com
          </p>
        </div>

        <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          <p>© 2024 Casa Piñón Ebanistería. Todos los derechos reservados.</p>
        </div>
      </div>
    `
  };
};

// Email sending functions
const sendOrderConfirmation = async (order, customerInfo) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email credentials not configured, skipping email send');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    const emailContent = createOrderConfirmationEmail(order, customerInfo);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerInfo.email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

const sendPaymentStatusEmail = async (order, customerInfo, paymentDetails, paymentStatus) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email credentials not configured, skipping email send');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    const emailContent = createPaymentStatusEmail(order, customerInfo, paymentDetails, paymentStatus);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerInfo.email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment ${paymentStatus} email sent:`, result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Error sending payment ${paymentStatus} email:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmation,
  sendPaymentStatusEmail
};
