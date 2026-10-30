import assert from 'node:assert/strict';
import { test } from 'node:test';
import { proxyAccountDeletion } from '../app/api/account-deletion/proxy.ts';

const receipt = { version: 'account-deletion.v1', status: 'queued', requestId: '00000000-0000-4000-8000-000000000001', accessRevoked: true };
const body = { version: 'account-deletion.v1', confirmed: true };
const request = (data=body, headers={}) => new Request('https://www.creciendo.com.co/api/account-deletion', {
  method: 'POST', headers: { origin:'https://www.creciendo.com.co', authorization:'Bearer fixture-token', 'idempotency-key':'fixture-key', 'content-type':'application/json', ...headers }, body:JSON.stringify(data),
});
const fail = async () => assert.fail('Must not reach backend');

test('proxy rejects missing auth, foreign origins, target injection, missing confirmation and oversized input',async()=>{
  for(const [req,status] of [[request(body,{authorization:''}),401],[request(body,{origin:'https://foreign.invalid'}),403],[request(body,{origin:''}),403],[request({...body,userId:'other'}),400],[request({...body,confirmed:false}),400],[request(body,{'idempotency-key':''}),400],[request(body,{'content-type':'text/plain'}),400],[request({...body,padding:'x'.repeat(300)}),400]]){
    assert.equal((await proxyAccountDeletion(req,fail)).status,status);
  }
});

test('proxy pins backend and forwards only bearer, stable key and explicit confirmation',async()=>{
  const response=await proxyAccountDeletion(request(),async(url,init)=>{
    assert.equal(url,'https://agent.creciendo.com.co/creciendo/v1/account/deletion');
    assert.deepEqual(init.headers,{Authorization:'Bearer fixture-token','Idempotency-Key':'fixture-key','Content-Type':'application/json'});
    assert.deepEqual(JSON.parse(init.body),body);
    assert.equal(init.credentials,'omit');assert.equal(init.redirect,'error');assert.equal(init.cache,'no-store');
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json(receipt,{status:202});
  });
  assert.equal(response.status,202);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.deepEqual(await response.json(),receipt);
});

test('proxy fails closed and redacts upstream errors and malformed receipts',async()=>{
  for(const upstream of [()=>Response.json({secret:'private'}, {status:500}),()=>Response.json(receipt),()=>Response.json({...receipt,accessRevoked:false},{status:202}),()=>Response.json({...receipt,extra:true},{status:202}),()=>Response.json(null,{status:202}),()=>{throw Error('private provider details');}]){
    const response=await proxyAccountDeletion(request(),upstream);
    assert.equal(response.status,503);assert.deepEqual(await response.json(),{ok:false});
  }
  assert.equal((await proxyAccountDeletion(request(),async()=>Response.json({}, {status:401}))).status,401);
});
