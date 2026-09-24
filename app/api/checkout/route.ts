import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const totalAmount = body.totalAmount || body.amount || body.grandTotal || 0;
    const customerName = body.customerName || body.fullName || 'Guest Checkout';
    const email = body.email || 'guest@example.com'; 
    const phone = body.phone || '0000000000'; 
    const address = body.deliveryAddress || 'No address provided';
    const items = body.items || [];
    
    // 1. VALIDATE STOCK FIRST
    for (const item of items) {
      // Look at the correct table (Main Catalog vs Premium)
      const table = item.tableType || 'products';
      
      const { data: productData, error: productError } = await supabase
        .from(table)
        .select('stock_count, name')
        .eq('id', item.product_id)
        .single();

      if (productError || !productData) {
        return NextResponse.json({ success: false, error: `Product ${item.name} not found.` });
      }

      // If they try to buy more than what is left, reject the order completely
      if (productData.stock_count < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          error: `Not enough stock for ${item.name}. Only ${productData.stock_count} remaining.` 
        });
      }
    }

    // 2. GENERATE ORDER TRACKING
    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingCode = `ORD-${shortId}`;

    // 3. INSERT ORDER
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          customer_email: email,
          customer_phone: phone,
          delivery_address: address,
          items: items, 
          total_amount: totalAmount,
          tracking_code: trackingCode,
          status: 'payment_confirmed',
        }
      ])
      .select()
      .single();

    if (orderError) throw new Error('Failed to save order to database');

    // 4. AUTO-DEDUCT INVENTORY
    for (const item of items) {
      const table = item.tableType || 'products';
      
      // Fetch current stock again to be safe
      const { data: currentProduct } = await supabase
        .from(table)
        .select('stock_count')
        .eq('id', item.product_id)
        .single();
        
      if (currentProduct) {
        // Subtract purchased quantity
        await supabase
          .from(table)
          .update({ stock_count: currentProduct.stock_count - item.quantity })
          .eq('id', item.product_id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order processed successfully',
      trackingCode: trackingCode,
      orderId: orderData.id
    });

  } catch (error) {
    console.error('Manual Checkout Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong processing your manual order.' }, 
      { status: 500 }
    );
  }
}