import concurrent.futures, pathlib, json, re, html, urllib.request, xml.etree.ElementTree as ET, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
CACHE=ROOT/'research'/'pages'; CACHE.mkdir(parents=True,exist_ok=True)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','i':'http://www.google.com/schemas/sitemap-image/1.1'}
tree=ET.parse(ROOT/'research'/'sitemap.xml')
entries=[(u.find('s:loc',ns).text,u.find('i:image/i:loc',ns).text) for u in tree.getroot() if u.find('i:image/i:loc',ns) is not None]
def clean(s):
    s=re.sub(r'</(?:p|li|h\d)>|<br\s*/?>','\n',s)
    return html.unescape(re.sub('<[^>]+>','',s)).strip()
def extract(pattern,s,default=''):
    m=re.search(pattern,s,re.S); return m.group(1) if m else default
def get(entry):
    url,image=entry; slug=url.rstrip('/').split('/')[-1]; dest=CACHE/(slug+'.html')
    for attempt in range(3):
        try:
            if dest.exists(): source=dest.read_text(encoding='utf-8')
            else:
                req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; CatalogMigration/1.0)'})
                source=urllib.request.urlopen(req,timeout=40).read().decode('utf-8'); dest.write_text(source,encoding='utf-8')
            name=clean(extract(r'<h1[^>]*>(.*?)</h1>',source))
            if not name: raise ValueError('Missing product title')
            raw=json.loads(extract(r'var stock = (.*?);\s*\n',source,'[]'))
            prod=json.loads(extract(r'var s_producto = (.*?);\s*\n',source,'{}'))
            images=re.findall(r'<img[^>]+(?:src|data-src)="([^"]+)"[^>]*class="product-vip__carrousel-image',source)
            variants=[{'id':str(v['idStock']),'name':' / '.join(a['valor']['vat_valor'] for a in v.get('valoratributo',[])) or 'Presentación única','price':v['s_precio_oferta'] if v.get('s_oferta') and v.get('s_precio_oferta') else v['s_precio'],'available':bool(v.get('s_ilimitado') or v.get('s_cantidad',0)>0),'minQuantity':max(1,v.get('s_cantidad_minima',1))} for v in raw]
            crumbs=re.findall(r'<a[^>]+class="breadcrumb__link[^>]*>(.*?)</a>',source,re.S)
            parts=urllib.parse.urlparse(url).path.strip('/').split('/')
            return {'id':extract(r'name="product" value="(\d+)"',source,slug),'slug':slug,'name':name,'category':parts[0],'subcategory':parts[1] if len(parts)>2 else '', 'subcategoryName':clean(crumbs[-2]) if len(crumbs)>3 else '', 'description':clean(extract(r'<div class="product-vip__description[^>]*>(.*?)</div>',source)), 'price':prod.get('precio'), 'available':bool(prod.get('stock')), 'image':images[0] if images else image,'images':images or [image],'variants':variants,'sourceUrl':url}
        except Exception as e:
            if attempt==2:return {'error':str(e),'sourceUrl':url}
            time.sleep(1)
print('Catalog entries:',len(entries),flush=True)
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    for i,p in enumerate(pool.map(get,entries)):
        results.append(p)
        if (i+1)%25==0:print('Processed',i+1,flush=True)
errors=[p for p in results if 'error' in p]
(ROOT/'src'/'data').mkdir(parents=True,exist_ok=True)
(ROOT/'src'/'data'/'products.json').write_text(json.dumps([p for p in results if 'error' not in p],ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(ROOT/'research'/'crawl-report.json').write_text(json.dumps({'sourceCount':len(entries),'imported':len(results)-len(errors),'errors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
print('Complete:',len(results)-len(errors),'Errors:',errors,flush=True)
