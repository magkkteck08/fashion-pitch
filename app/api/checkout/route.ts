import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const extractUUID = (str: any) => {
  if (!str) return null;
  const match = String(str).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, deliveryState, deliveryAddress, items, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }
    
    if (!deliveryState) {
      return NextResponse.json({ success: false, error: 'Delivery state is required' }, { status: 400 });
    }

    const trackingCode = 'ORD-' + Math.random().toString(16).slice(2, 8).toUpperCase();
    const fullDeliveryAddress = `${deliveryAddress}, ${deliveryState} State`;

    const { data: vendorsData } = await supabase.from('verified_vendors').select('*');
    const vendors = vendorsData || [];

    const itemIds = items.map((i: any) => extractUUID(i.productId) || extractUUID(i.id) || extractUUID(i.cartId)).filter(Boolean);
    const { data: mainProducts } = await supabase.from('products').select('id, vendor_id').in('id', itemIds);
    const { data: sigProducts } = await supabase.from('signature_products').select('id, vendor_id').in('id', itemIds);
    const allDbProducts = [...(mainProducts || []), ...(sigProducts || [])];

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          tracking_code: trackingCode,
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
          delivery_address: fullDeliveryAddress,
          total_amount: totalAmount,
          items: items, 
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }

    const vendorGroups: Record<string, any> = {};
    
    items.forEach((item: any) => {
      const targetId = extractUUID(item.productId) || extractUUID(item.id) || extractUUID(item.cartId);
      const dbProduct = allDbProducts.find(p => p.id === targetId);
      const vId = dbProduct?.vendor_id || item.vendor_id;
      
      if (!vendorGroups[vId]) {
        vendorGroups[vId] = { items: [], subtotal: 0, delivery_fee: 0 };
        
        if (vId) {
          const vendor = vendors.find(v => v.id === vId);
          if (vendor && vendor.state_delivery_fees) {
            let stateFees = vendor.state_delivery_fees;
            if (typeof stateFees === 'string') {
               try { stateFees = JSON.parse(stateFees); } catch(e) { stateFees = {}; }
            }

            if (stateFees[deliveryState] !== undefined && stateFees[deliveryState] !== null) {
              vendorGroups[vId].delivery_fee = Number(stateFees[deliveryState]);
            } else if (stateFees['Default'] !== undefined && stateFees['Default'] !== null) {
              vendorGroups[vId].delivery_fee = Number(stateFees['Default']);
            } else {
              vendorGroups[vId].delivery_fee = 3000;
            }
          }
        } else {
          vendorGroups[vId].delivery_fee = 3000;
        }
      }
      
      vendorGroups[vId].items.push(item);
      vendorGroups[vId].subtotal += (item.price * item.quantity);
    });

    const fulfillmentInserts = Object.keys(vendorGroups).map(vId => {
       const group = vendorGroups[vId];
       return {
         order_id: orderData.id,
         vendor_id: vId === 'undefined' || vId === 'null' ? null : vId,
         vendor_subtotal: group.subtotal,
         vendor_delivery_fee: group.delivery_fee,
         items: group.items, 
         status: 'pending'
       };
    });

    await supabase.from('order_fulfillments').insert(fulfillmentInserts);

    return NextResponse.json({ success: true, trackingCode });

  } catch (err: any) {
    console.error('Checkout API Crash:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}