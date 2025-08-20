import nodemailer from 'nodemailer';

const EMAIL_SENDING_ENABLED = process.env.EMAIL_SENDING_ENABLED !== '0';

// Email configuration - optimized for Zoho
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'pagos@casapinon.co',
      pass: process.env.EMAIL_PASSWORD
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

// Enhanced helper function to extract order number with multiple fallbacks
const extractOrderNumber = (order) => {
  // Try multiple possible paths for order number
  const possiblePaths = [
    'orderNumber',
    'order_number', 
    'id',
    'external_reference'
  ];
  
  for (const path of possiblePaths) {
    const value = safeExtract(order, path);
    if (value && value !== 'N/A') {
      return value;
    }
  }
  
  // If no order number found, generate a fallback
  if (order && order.id) {
    return `CP-${order.id}`;
  }
  
  return `CP-${Date.now()}`;
};

// Enhanced helper function to extract creation date with multiple fallbacks
const extractOrderDate = (order) => {
  // Try multiple possible paths for date
  const possiblePaths = [
    'createdAt',
    'created_at',
    'created_date',
    'order_date',
    'date'
  ];
  
  for (const path of possiblePaths) {
    const value = safeExtract(order, path);
    if (value && value !== 'N/A') {
      return formatDate(value);
    }
  }
  
  // If no date found, use current date
  return new Date().toLocaleDateString('es-CO');
};

// Enhanced helper function to extract items with better fallbacks
const extractItemsList = (order) => {
  try {
    const items = safeExtract(order, 'items');
    if (items && Array.isArray(items) && items.length > 0) {
      return items.map(item => {
        const itemName = safeExtract(item, 'name') || 
                        safeExtract(item, 'product.name') || 
                        safeExtract(item, 'product_name') || 
                        'Producto sin nombre';
        const itemPrice = safeExtract(item, 'price') || 
                         safeExtract(item, 'product.price') || 
                         safeExtract(item, 'product_price') || 
                         0;
        const itemQuantity = safeExtract(item, 'quantity') || 1;
        
        return `• ${itemName} x${itemQuantity} - ${formatCurrency(itemPrice)}`;
      }).join('\n');
    }
    
    // Try alternative item paths
    const alternativePaths = ['products', 'order_items', 'cart_items'];
    for (const path of alternativePaths) {
      const altItems = safeExtract(order, path);
      if (altItems && Array.isArray(altItems) && altItems.length > 0) {
        return altItems.map(item => {
          const itemName = safeExtract(item, 'name') || 'Producto sin nombre';
          const itemPrice = safeExtract(item, 'price') || 0;
          const itemQuantity = safeExtract(item, 'quantity') || 1;
          return `• ${itemName} x${itemQuantity} - ${formatCurrency(itemPrice)}`;
        }).join('\n');
      }
    }
    
    return 'Productos no especificados';
  } catch (error) {
    return 'Error al cargar productos';
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

// URLs
const FRONTEND_URL = process.env.BASE_URL || 'https://casapinon.co';

// Email templates
const createOrderConfirmationEmail = (order, customerInfo) => {
  // Use enhanced helper functions for better data extraction
  const orderNumber = extractOrderNumber(order);
  const orderDate = extractOrderDate(order);
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
  
  // Use enhanced helper function for items list
  const itemsList = extractItemsList(order);

  // Create payment status link (will be updated when payment is processed)
  const paymentStatusLink = `${FRONTEND_URL}/payment-status?order=${orderNumber}`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  const browserViewUrl = `${FRONTEND_URL}/emails/view?template=order-confirmation&order=${encodeURIComponent(orderNumber)}`;

  return {
    subject: `Confirmación de Pedido #${orderNumber} - Casa Piñón Ebanistería`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="margin-bottom: 15px;">
            <img src="cid:logo-email-v2@casapinon" alt="Casa Piñón" width="240" style="display:block; margin:0 auto 15px; border-radius:8px; max-width:100%; height:auto;" />
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
            <strong>WhatsApp:</strong> +57 301 466 4444 (<a href="https://wa.me/573014664444" style="color: #155724; text-decoration: underline;">chatear</a>)<br>
            <strong>Email:</strong> info@casapinon.co
          </p>
        </div>

        <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          <p>© 2024 Casa Piñón Ebanistería. Todos los derechos reservados.</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="margin: 5px 0;">Síguenos en redes sociales:</p>
            <div style="margin: 10px 0;">
              <a href="https://instagram.com/casapinon" style="color: #8B4513; text-decoration: none; margin: 0 10px;">📸 Instagram</a>
              <a href="https://facebook.com/casapinon" style="color: #8B4513; text-decoration: none; margin: 0 10px;">📘 Facebook</a>
              <a href="https://wa.me/573014664444" style="color: #8B4513; text-decoration: none; margin: 0 10px;">💬 WhatsApp</a>
            </div>
            <p style="margin: 5px 0; font-size: 11px;">
              Este email fue enviado a ${customerEmail}. 
              <a href="${unsubscribeUrl}" style="color: #8B4513;">Cancelar suscripción</a> | 
              <a href="${browserViewUrl}" style="color: #8B4513;">Ver en navegador</a>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Casa Piñón Ebanistería\n\nConfirmación de Pedido #${orderNumber}\nFecha: ${orderDate}\nEstado del pago: ${paymentStatus === 'paid' ? 'Pagado' : paymentStatus === 'pending' ? 'Pendiente' : 'Fallido'}\n\nProductos:\n${itemsList}\n\nTotal: ${total}\n\nEntrega\nNombre: ${customerName}\nEmail: ${customerEmail}\nTeléfono: ${customerPhone}\nDirección: ${customerAddress}\nZona de envío: ${shippingZone}\nEntrega Estimada: ${estimatedDelivery}\n\nVerificar estado del pago: ${paymentStatusLink}\nContacto WhatsApp: https://wa.me/573014664444\nEmail: info@casapinon.co\n\nCancelar suscripción: ${unsubscribeUrl}\nVer en navegador: ${browserViewUrl}`
  };
};

const createPaymentStatusEmail = (order, customerInfo, paymentDetails, paymentStatus) => {
  // Use enhanced helper functions for better data extraction
  const orderNumber = extractOrderNumber(order);
  const orderDate = extractOrderDate(order);
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

  // Create real payment status link - use unified frontend URL
  const paymentStatusLink = `${FRONTEND_URL}/payment-status?order=${orderNumber}`;
  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  const browserViewUrl = `${FRONTEND_URL}/emails/view?template=payment-status&status=${encodeURIComponent(paymentStatus)}&order=${encodeURIComponent(orderNumber)}`;

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
            <a href="https://casapinon.co" target="_blank" rel="noopener">
              <img src="cid:logo-email-v2@casapinon" alt="Casa Piñón" width="240" style="display:block; margin:0 auto 15px; border-radius:8px; max-width:100%; height:auto;" />
            </a>
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
            <strong>WhatsApp:</strong> +57 301 466 4444 (<a href="https://wa.me/573014664444" style="color: #856404; text-decoration: underline;">chatear</a>)<br>
            <strong>Email:</strong> info@casapinon.co
          </p>
        </div>

        <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          <p>© 2024 Casa Piñón Ebanistería. Todos los derechos reservados.</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="margin: 5px 0;">Síguenos en redes sociales:</p>
            <div style="margin: 10px 0;">
              <a href="https://instagram.com/casapinon" style="color: #8B4513; text-decoration: none; margin: 0 10px;">📸 Instagram</a>
              <a href="https://facebook.com/casapinon" style="color: #8B4513; text-decoration: none; margin: 0 10px;">📘 Facebook</a>
              <a href="https://wa.me/573014664444" style="color: #8B4513; text-decoration: none; margin: 0 10px;">💬 WhatsApp</a>
            </div>
            <p style="margin: 5px 0; font-size: 11px;">
              Este email fue enviado a ${customerEmail}. 
              <a href="${unsubscribeUrl}" style="color: #8B4513;">Cancelar suscripción</a> | 
              <a href="${browserViewUrl}" style="color: #8B4513;">Ver en navegador</a>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Casa Piñón Ebanistería\n\n${statusContent.title} - Pedido #${orderNumber}\n${statusContent.subtitle}\n\nHola ${customerName},\n${statusContent.message}\n\nDetalles del Pedido\nNúmero: ${orderNumber}\nFecha: ${orderDate}\nEstado del pago: ${statusContent.statusText}\n\nProductos:\n${itemsList}\n\nTotal: ${total}\n\nPago\nID: ${paymentId}\nMétodo: ${paymentMethod}\nFecha: ${paymentDate}\nMonto: ${paymentAmount}\n\nEntrega\nNombre: ${customerName}\nEmail: ${customerEmail}\nTeléfono: ${customerPhone}\nDirección: ${customerAddress}\nZona: ${shippingZone}\nEntrega Estimada: ${estimatedDelivery}\n\nVerificar estado del pago: ${paymentStatusLink}\nContacto WhatsApp: https://wa.me/573014664444\nEmail: info@casapinon.co\n\nCancelar suscripción: ${unsubscribeUrl}\nVer en navegador: ${browserViewUrl}`
  };
};

// Email sending functions
const sendOrderConfirmation = async (order, customerInfo) => {
  try {
    if (!EMAIL_SENDING_ENABLED) {
      console.log('⚠️ Email sending disabled by EMAIL_SENDING_ENABLED');
      return { success: false, error: 'Email sending disabled' };
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email credentials not configured, skipping email send');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    const emailContent = createOrderConfirmationEmail(order, customerInfo);

    const mailOptions = {
      from: `"Casa Piñón" <${process.env.EMAIL_USER || 'pagos@casapinon.co'}>`,
      to: customerInfo.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      replyTo: 'info@casapinon.co',
      headers: {
        'List-Unsubscribe': `<mailto:unsubscribe@casapinon.co?subject=unsubscribe>, <${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(customerInfo.email || '')}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      attachments: [
        {
          filename: 'logo-email.png',
          path: `${FRONTEND_URL}/logo-email.png`,
          cid: 'logo-email-v2@casapinon'
        }
      ]
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
    if (!EMAIL_SENDING_ENABLED) {
      console.log('⚠️ Email sending disabled by EMAIL_SENDING_ENABLED');
      return { success: false, error: 'Email sending disabled' };
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email credentials not configured, skipping email send');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    const emailContent = createPaymentStatusEmail(order, customerInfo, paymentDetails, paymentStatus);

    const mailOptions = {
      from: `"Casa Piñón" <${process.env.EMAIL_USER || 'pagos@casapinon.co'}>`,
      to: customerInfo.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      replyTo: 'info@casapinon.co',
      headers: {
        'List-Unsubscribe': `<mailto:unsubscribe@casapinon.co?subject=unsubscribe>, <${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(customerInfo.email || '')}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      attachments: [
        {
          filename: 'logo-email.png',
          path: `${FRONTEND_URL}/logo-email.png`,
          cid: 'logo-email-v2@casapinon'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment ${paymentStatus} email sent:`, result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Error sending payment ${paymentStatus} email:`, error);
    return { success: false, error: error.message };
  }
};

export {
  sendOrderConfirmation,
  sendPaymentStatusEmail
};
