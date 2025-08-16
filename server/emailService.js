const nodemailer = require('nodemailer');

// Email configuration - optimized for speed
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
    },
    // Optimize for speed
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 5, // 5 emails per second
    // Faster timeout
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
};

// Helper function to safely extract and format data
const safeExtract = (data, path, defaultValue = 'N/A') => {
  try {
    const keys = path.split('.');
    let value = data;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    
    return value;
  } catch (error) {
    return defaultValue;
  }
};

// Helper function to format address
const formatAddress = (address) => {
  if (!address) return 'N/A';
  
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object') {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Dirección no especificada';
  }
  
  return 'Dirección no especificada';
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'Fecha no especificada';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Fecha no válida';
    }
    return dateObj.toLocaleDateString('es-CO');
  } catch (error) {
    return 'Fecha no válida';
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$ 0';
  }
  
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return `$ ${amount}`;
  }
};

// Email templates
const createOrderConfirmationEmail = (order, customerInfo) => {
  // Safely extract data with fallbacks
  const orderNumber = safeExtract(order, 'orderNumber') || safeExtract(order, 'order_number') || 'N/A';
  const orderDate = formatDate(safeExtract(order, 'createdAt') || safeExtract(order, 'created_at'));
  const paymentStatus = safeExtract(order, 'paymentStatus') || safeExtract(order, 'payment_status') || 'pending';
  const total = formatCurrency(safeExtract(order, 'total'));
  const shippingZone = safeExtract(order, 'shippingZone') || safeExtract(order, 'shipping_zone') || 'No especificada';
  const estimatedDelivery = safeExtract(order, 'estimatedDelivery') || safeExtract(order, 'estimated_delivery') || 'Por confirmar';
  
  // Extract customer info with fallbacks
  const customerName = safeExtract(customerInfo, 'name') || 
                      safeExtract(customerInfo, 'customer_name') || 
                      safeExtract(order, 'customer.name') || 
                      safeExtract(order, 'customer_name') || 
                      'Cliente';
  const customerEmail = safeExtract(customerInfo, 'email') || 
                       safeExtract(customerInfo, 'customer_email') || 
                       safeExtract(order, 'customer.email') || 
                       safeExtract(order, 'customer_email') || 
                       'Email no especificado';
  const customerPhone = safeExtract(customerInfo, 'phone') || 
                       safeExtract(customerInfo, 'customer_phone') || 
                       safeExtract(order, 'customer.phone') || 
                       safeExtract(order, 'customer_phone') || 
                       'Teléfono no especificado';
  const customerAddress = formatAddress(
    safeExtract(customerInfo, 'address') || 
    safeExtract(customerInfo, 'customer_address') || 
    safeExtract(order, 'customer.address') || 
    safeExtract(order, 'customer_address')
  );
  
  // Format items list safely
  let itemsList = 'Productos no especificados';
  try {
    const items = safeExtract(order, 'items');
    if (items && Array.isArray(items) && items.length > 0) {
      itemsList = items.map(item => {
        const itemName = safeExtract(item, 'name') || 'Producto sin nombre';
        const itemPrice = formatCurrency(safeExtract(item, 'price'));
        return `• ${itemName} - ${itemPrice}`;
      }).join('\n');
    }
  } catch (error) {
    itemsList = 'Error al cargar productos';
  }

  // Create payment status link (will be updated when payment is processed)
  const frontendUrl = 'https://casapi-on-production.up.railway.app';
  const paymentStatusLink = `${frontendUrl}/payment-status?order=${orderNumber}`;

  return {
    subject: `Confirmación de Pedido #${orderNumber} - Casa Piñón Ebanistería`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="margin-bottom: 15px;">
            <!-- Placeholder for company logo - replace with actual logo URL -->
            <div style="width: 80px; height: 80px; background-color: #8B4513; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">CP</span>
            </div>
          </div>
          <h1 style="color: #8B4513; margin: 0; font-size: 28px;">Casa Piñón Ebanistería</h1>
          <p style="color: #666; margin: 5px 0; font-size: 16px;">Artesanía en madera de piñón</p>
          <div style="width: 60px; height: 3px; background-color: #8B4513; margin: 15px auto 0;"></div>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">¡Gracias por tu pedido!</h2>
          <p>Hola ${customerName},</p>
          <p>Hemos recibido tu pedido y estamos procesándolo. Aquí están los detalles:</p>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Pedido</h3>
          <p><strong>Número de Pedido:</strong> ${orderNumber}</p>
          <p><strong>Fecha:</strong> ${orderDate}</p>
          <p><strong>Estado del Pago:</strong> 
            <span style="color: ${paymentStatus === 'paid' ? '#28a745' : paymentStatus === 'pending' ? '#ffc107' : '#dc3545'}; font-weight: bold;">
              ${paymentStatus === 'paid' ? 'Pagado' : paymentStatus === 'pending' ? 'Pendiente' : 'Fallido'}
            </span>
          </p>
          
          <h4 style="color: #333; margin-top: 20px;">Productos:</h4>
          <div style="margin-left: 20px; white-space: pre-line;">
            ${itemsList}
          </div>
          
          <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px;">
            <p style="text-align: right; font-size: 18px; font-weight: bold;">
              <strong>Total:</strong> ${total}
            </p>
          </div>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Información de Entrega</h3>
          <p><strong>Nombre:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Teléfono:</strong> ${customerPhone}</p>
          <p><strong>Dirección:</strong> ${customerAddress}</p>
          <p><strong>Zona de Envío:</strong> ${shippingZone}</p>
          <p><strong>Entrega Estimada:</strong> ${estimatedDelivery}</p>
        </div>

        ${paymentStatus === 'pending' ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Pago Pendiente</h4>
            <p style="color: #856404; margin-bottom: 0;">
              Tu pago está siendo procesado. Te enviaremos una confirmación por email 
              tan pronto como se complete el pago.
            </p>
          </div>
        ` : ''}

        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h4 style="color: #1565c0; margin-top: 0;">🔗 Verificar Estado del Pago</h4>
          <p style="color: #1565c0; margin-bottom: 10px;">
            Puedes verificar el estado actual de tu pago en cualquier momento:
          </p>
          <div style="text-align: center;">
            <a href="${paymentStatusLink}" 
               style="display: inline-block; background-color: #1565c0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verificar Estado del Pago
            </a>
          </div>
          <p style="color: #1565c0; margin-top: 10px; margin-bottom: 0; font-size: 12px;">
            O copia este enlace: <a href="${paymentStatusLink}" style="color: #1565c0;">${paymentStatusLink}</a>
          </p>
        </div>

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
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="margin: 5px 0;">Síguenos en redes sociales:</p>
            <div style="margin: 10px 0;">
              <a href="https://instagram.com/casapinon" style="color: #8B4513; text-decoration: none; margin: 0 10px;">📸 Instagram</a>
              <a href="https://facebook.com/casapinon" style="color: #8B4513; text-decoration: none; margin: 0 10px;">📘 Facebook</a>
              <a href="https://wa.me/573001234567" style="color: #8B4513; text-decoration: none; margin: 0 10px;">💬 WhatsApp</a>
            </div>
            <p style="margin: 5px 0; font-size: 11px;">
              Este email fue enviado a ${customerEmail}. 
              <a href="#" style="color: #8B4513;">Cancelar suscripción</a> | 
              <a href="#" style="color: #8B4513;">Ver en navegador</a>
            </p>
          </div>
        </div>
      </div>
    `
  };
};

const createPaymentStatusEmail = (order, customerInfo, paymentDetails, paymentStatus) => {
  // Safely extract data with fallbacks
  const orderNumber = safeExtract(order, 'orderNumber') || safeExtract(order, 'order_number') || 'N/A';
  const orderDate = formatDate(safeExtract(order, 'createdAt') || safeExtract(order, 'created_at'));
  const total = formatCurrency(safeExtract(order, 'total'));
  const shippingZone = safeExtract(order, 'shippingZone') || safeExtract(order, 'shipping_zone') || 'No especificada';
  const estimatedDelivery = safeExtract(order, 'estimatedDelivery') || safeExtract(order, 'estimated_delivery') || 'Por confirmar';
  
  // Extract customer info with fallbacks
  const customerName = safeExtract(customerInfo, 'name') || 
                      safeExtract(customerInfo, 'customer_name') || 
                      safeExtract(order, 'customer.name') || 
                      safeExtract(order, 'customer_name') || 
                      'Cliente';
  const customerEmail = safeExtract(customerInfo, 'email') || 
                       safeExtract(customerInfo, 'customer_email') || 
                       safeExtract(order, 'customer.email') || 
                       safeExtract(order, 'customer_email') || 
                       'Email no especificado';
  const customerPhone = safeExtract(customerInfo, 'phone') || 
                       safeExtract(customerInfo, 'customer_phone') || 
                       safeExtract(order, 'customer.phone') || 
                       safeExtract(order, 'customer_phone') || 
                       'Teléfono no especificado';
  const customerAddress = formatAddress(
    safeExtract(customerInfo, 'address') || 
    safeExtract(customerInfo, 'customer_address') || 
    safeExtract(order, 'customer.address') || 
    safeExtract(order, 'customer_address')
  );
  
  // Format items list safely
  let itemsList = 'Productos no especificados';
  try {
    const items = safeExtract(order, 'items');
    if (items && Array.isArray(items) && items.length > 0) {
      itemsList = items.map(item => {
        const itemName = safeExtract(item, 'name') || 'Producto sin nombre';
        const itemPrice = formatCurrency(safeExtract(item, 'price'));
        return `• ${itemName} - ${itemPrice}`;
      }).join('\n');
    }
  } catch (error) {
    itemsList = 'Error al cargar productos';
  }

  // Create real payment status link - use frontend URL
  const frontendUrl = 'https://xn--casapion-i3a.co';
  const paymentStatusLink = `${frontendUrl}/payment-status?order=${orderNumber}`;

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
      case 'cancelled':
        return {
          title: '🚫 Pago Cancelado',
          subtitle: 'Has cancelado el proceso de pago',
          message: 'Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu cuenta.',
          statusColor: '#6c757d',
          statusText: 'Cancelado',
          bgColor: '#f8f9fa',
          textColor: '#495057',
          nextSteps: 'Si cambias de opinión, puedes completar tu pedido visitando tu carrito de compras en cualquier momento.'
        };
      case 'rejected':
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

  // Safely extract payment details
  const paymentId = safeExtract(paymentDetails, 'id') || 'N/A';
  const paymentMethod = safeExtract(paymentDetails, 'payment_method_id') || 'No especificado';
  const paymentDate = formatDate(safeExtract(paymentDetails, 'date_approved') || safeExtract(paymentDetails, 'date_created'));
  const paymentAmount = formatCurrency(safeExtract(paymentDetails, 'transaction_amount'));

  return {
    subject: `${statusContent.title} Pedido #${orderNumber} - Casa Piñón Ebanistería`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="margin-bottom: 15px;">
            <!-- Placeholder for company logo - replace with actual logo URL -->
            <div style="width: 80px; height: 80px; background-color: #8B4513; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">CP</span>
            </div>
          </div>
          <h1 style="color: ${statusContent.statusColor}; margin: 0; font-size: 28px;">${statusContent.title}</h1>
          <p style="color: #666; margin: 5px 0; font-size: 16px;">Casa Piñón Ebanistería</p>
          <div style="width: 60px; height: 3px; background-color: #8B4513; margin: 15px auto 0;"></div>
        </div>
        
        <div style="background-color: ${statusContent.bgColor}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: ${statusContent.textColor}; margin-top: 0;">${statusContent.subtitle}</h2>
          <p style="color: ${statusContent.textColor};">Hola ${customerName},</p>
          <p style="color: ${statusContent.textColor};">${statusContent.message}</p>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Pedido</h3>
          <p><strong>Número de Pedido:</strong> ${orderNumber}</p>
          <p><strong>Fecha:</strong> ${orderDate}</p>
          <p><strong>Estado del Pago:</strong> 
            <span style="color: ${statusContent.statusColor}; font-weight: bold;">${statusContent.statusText}</span>
          </p>
          
          <h4 style="color: #333; margin-top: 20px;">Productos:</h4>
          <div style="margin-left: 20px; white-space: pre-line;">
            ${itemsList}
          </div>
          
          <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px;">
            <p style="text-align: right; font-size: 18px; font-weight: bold;">
              <strong>Total:</strong> ${total}
            </p>
          </div>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Pago</h3>
          <p><strong>ID de Pago:</strong> ${paymentId}</p>
          <p><strong>Método de Pago:</strong> ${paymentMethod}</p>
          <p><strong>Fecha de Pago:</strong> ${paymentDate}</p>
          <p><strong>Monto:</strong> ${paymentAmount}</p>
        </div>

        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Información de Entrega</h3>
          <p><strong>Nombre:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Teléfono:</strong> ${customerPhone}</p>
          <p><strong>Dirección:</strong> ${customerAddress}</p>
          <p><strong>Zona de Envío:</strong> ${shippingZone}</p>
          <p><strong>Entrega Estimada:</strong> ${estimatedDelivery}</p>
        </div>

        <div style="background-color: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h4 style="color: #155724; margin-top: 0;">📦 Próximos Pasos</h4>
          <p style="color: #155724; margin-bottom: 0;">
            ${statusContent.nextSteps}
          </p>
        </div>

        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h4 style="color: #1565c0; margin-top: 0;">🔗 Verificar Estado del Pago</h4>
          <p style="color: #1565c0; margin-bottom: 10px;">
            Puedes verificar el estado actual de tu pago en cualquier momento:
          </p>
          <div style="text-align: center;">
            <a href="${paymentStatusLink}" 
               style="display: inline-block; background-color: #1565c0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verificar Estado del Pago
            </a>
          </div>
          <p style="color: #1565c0; margin-top: 10px; margin-bottom: 0; font-size: 12px;">
            O copia este enlace: <a href="${paymentStatusLink}" style="color: #1565c0;">${paymentStatusLink}</a>
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
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="margin: 5px 0;">Síguenos en redes sociales:</p>
            <div style="margin: 10px 0;">
              <a href="https://instagram.com/casapinon" style="color: #8B4513; text-decoration: none; margin: 0 10px;">📸 Instagram</a>
              <a href="https://facebook.com/casapinon" style="color: #8B4513; text-decoration: none; margin: 0 10px;">📘 Facebook</a>
              <a href="https://wa.me/573001234567" style="color: #8B4513; text-decoration: none; margin: 0 10px;">💬 WhatsApp</a>
            </div>
            <p style="margin: 5px 0; font-size: 11px;">
              Este email fue enviado a ${customerEmail}. 
              <a href="#" style="color: #8B4513;">Cancelar suscripción</a> | 
              <a href="#" style="color: #8B4513;">Ver en navegador</a>
            </p>
          </div>
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
