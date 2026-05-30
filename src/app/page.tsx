"use client";
import { useState, useRef, useCallback } from "react";

const P = {
  card:"#FFFFFF",accent:"#FF6B9D",accent2:"#C44DBA",
  soft:"#FFE0EC",text:"#2D1B2E",muted:"#9B7FA6",
  border:"#F0C8DB",gold:"#F7B731",green:"#26de81",
  yellow:"#fed330",red:"#fc5c65",
};

const ScoreRing = ({score,label,color}:{score:number,label:string,color:string}) => {
  const r=36,circ=2*Math.PI*r,offset=circ-(score/100)*circ;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={44} cy={44} r={r} fill="none" stroke={P.soft} strokeWidth={8}/>
        <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 44 44)" style={{transition:"stroke-dashoffset 1.2s"}}/>
        <text x={44} y={49} textAnchor="middle" fontSize={20} fontWeight={700} fill={P.text}>{score}</text>
      </svg>
      <span style={{fontSize:12,color:P.muted,fontWeight:600}}>{label}</span>
    </div>
  );
};

const scoreColor=(s:number)=>s>=80?P.green:s>=60?P.gold:P.red;

export default function Home() {
  const [image,setImage]=useState<string|null>(null);
  const [imageBase64,setImageBase64]=useState<string|null>(null);
  const [mediaType,setMediaType]=useState("image/jpeg");
  const [result,setResult]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);

  const handleFile=useCallback((file:File|null|undefined)=>{
    if(!file||!file.type.startsWith("image/"))return;
    const reader=new FileReader();
    reader.onload=(e)=>{
      const d=e.target?.result as string;
      setImage(d);setImageBase64(d.split(",")[1]);
      setMediaType(file.type);setResult(null);setError(null);
    };
    reader.readAsDataURL(file);
  },[]);

  const diagnose=async()=>{
    if(!imageBase64)return;
    setLoading(true);setError(null);
    try{
      const res=await fetch("/api/diagnose",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({imageBase64,mediaType}),
      });
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"エラー");
      setResult(data);
    }catch(e:any){setError(e.message);}
    finally{setLoading(false);}
  };

  const card={background:P.card,borderRadius:20,padding:"20px",boxShadow:"0 4px 24px #FF6B9D18",marginBottom:14};

  return (
    <main style={{maxWidth:480,margin:"0 auto",padding:"24px 16px 48px"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:36}}>💅</div>
        <h1 style={{fontSize:26,fontWeight:800,letterSpacing:2,margin:0,
          background:`linear-gradient(90deg,${P.accent},${P.accent2})`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          NAIL DIAGNOSIS
        </h1>
        <p style={{fontSize:13,color:P.muted,marginTop:4}}>AIによる爪の美しさ・健康診断</p>
      </div>

      <div onClick={()=>!image&&fileRef.current?.click()}
        style={{border:`2.5px dashed ${P.border}`,borderRadius:20,background:P.card,
          padding:image?0:"32px 16px",cursor:image?"default":"pointer",
          textAlign:"center",overflow:"hidden",marginBottom:16,boxShadow:"0 4px 24px #FF6B9D18"}}>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>handleFile(e.target.files?.[0])}/>
        {image?(
          <div style={{position:"relative"}}>
            <img src={image} alt="nail" style={{width:"100%",maxHeight:280,objectFit:"cover",display:"block",borderRadius:18}}/>
            <button onClick={e=>{e.stopPropagation();setImage(null);setImageBase64(null);setResult(null);}} style={{
              position:"absolute",top:10,right:10,background:"rgba(255,255,255,.85)",
              border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",
              fontSize:16,color:P.accent,fontWeight:700}}>×</button>
          </div>
        ):(
          <>
            <div style={{fontSize:40,marginBottom:8}}>🖼️</div>
            <p style={{color:P.muted,fontSize:14,margin:0}}>タップして写真を選択</p>
          </>
        )}
      </div>

      {image&&!result&&(
        <button onClick={diagnose} disabled={loading} style={{
          width:"100%",padding:"16px 0",
          background:loading?"#ddd":`linear-gradient(90deg,${P.accent},${P.accent2})`,
          color:"#fff",border:"none",borderRadius:16,fontSize:16,fontWeight:800,
          cursor:loading?"not-allowed":"pointer",marginBottom:16,
          boxShadow:loading?"none":`0 6px 20px ${P.accent}55`}}>
          {loading?(
            <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span style={{width:18,height:18,border:"3px solid #fff4",borderTop:"3px solid #fff",
                borderRadius:"50%",display:"inline-block",animation:"spin 0.8s linear infinite"}}/>
              診断中...
            </span>
          ):"💅 診断スタート"}
        </button>
      )}

      {error&&<div style={{color:P.red,textAlign:"center",fontSize:13,marginBottom:12}}>{error}</div>}

      {result&&(
        <div>
          <div style={{...card,textAlign:"center"}}>
            <div style={{fontSize:12,color:P.muted,letterSpacing:2,marginBottom:8}}>TOTAL SCORE</div>
            <div style={{fontSize:72,fontWeight:900,lineHeight:1,
              background:`linear-gradient(90deg,${P.accent},${P.accent2})`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{result.overall}</div>
            <div style={{fontSize:13,color:P.muted,marginTop:4}}>/ 100</div>
            <span style={{background:P.accent2+"22",color:P.accent2,border:`1.5px solid ${P.accent2}44`,
              borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700,
              display:"inline-block",margin:"8px 0"}}>{result.nailType}</span>
            <p style={{color:P.text,fontSize:14,marginTop:8,lineHeight:1.6}}>{result.comment}</p>
          </div>

          <div style={{...card,display:"flex",justifyContent:"space-around"}}>
            <ScoreRing score={result.shape} label="形" color={scoreColor(result.shape)}/>
            <ScoreRing score={result.color} label="色ツヤ" color={scoreColor(result.color)}/>
            <ScoreRing score={result.health} label="健康" color={scoreColor(result.health)}/>
          </div>

          <div style={card}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:P.green,letterSpacing:1,marginBottom:6}}>✓ GOOD POINTS</div>
              {result.goodPoints?.map((p:string,i:number)=>(
                <div key={i} style={{fontSize:13,color:P.text,padding:"4px 0 4px 12px",
                  borderLeft:`3px solid ${P.green}`,marginBottom:4}}>{p}</div>
              ))}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:P.accent,letterSpacing:1,marginBottom:6}}>✦ IMPROVEMENTS</div>
              {result.improvements?.map((p:string,i:number)=>(
                <div key={i} style={{fontSize:13,color:P.text,padding:"4px 0 4px 12px",
                  borderLeft:`3px solid ${P.accent}`,marginBottom:4}}>{p}</div>
              ))}
            </div>
          </div>

          <div style={card}>
            <span style={{background:P.green+"22",color:P.green,border:`2px solid ${P.green}`,
              borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:800}}>
              ✓ 健康状態: {result.healthStatus}
            </span>
            <p style={{fontSize:13,color:P.text,lineHeight:1.7,margin:"12px 0 0"}}>{result.healthAdvice}</p>
          </div>

          <button onClick={()=>{setImage(null);setImageBase64(null);setResult(null);}} style={{
            width:"100%",padding:"14px 0",background:"transparent",
            color:P.accent,border:`2px solid ${P.accent}`,
            borderRadius:16,fontSize:15,fontWeight:700,cursor:"pointer"}}>
            別の写真で診断する
          </button>
        </div>
      )}
    </main>
  );
}

