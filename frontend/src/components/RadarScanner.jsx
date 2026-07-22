import { motion } from 'framer-motion';

const RadarScanner = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[300px]">
      <div className="absolute inset-0 border-2 border-neon-cyan/20 rounded-full w-[300px] h-[300px] m-auto"></div>
      <div className="absolute inset-0 border border-neon-cyan/10 rounded-full w-[200px] h-[200px] m-auto"></div>
      <div className="absolute inset-0 border border-neon-cyan/5 rounded-full w-[100px] h-[100px] m-auto"></div>
      
      {/* Crosshairs */}
      <div className="absolute w-[300px] h-[1px] bg-neon-cyan/20"></div>
      <div className="absolute h-[300px] w-[1px] bg-neon-cyan/20"></div>

      {/* Center dot */}
      <div className="absolute w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]"></div>

      {/* Radar Sweep */}
      <motion.div 
        className="absolute w-[150px] h-[150px] origin-bottom-right"
        style={{
          background: 'conic-gradient(from 0deg at 100% 100%, transparent 0deg, rgba(0,240,255,0.4) 90deg, transparent 90deg)',
          left: 'calc(50% - 150px)',
          top: 'calc(50% - 150px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Blips */}
      <motion.div 
        className="absolute w-3 h-3 bg-neon-green rounded-full shadow-[0_0_8px_#39ff14]"
        style={{ top: '20%', left: '30%' }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div 
        className="absolute w-3 h-3 bg-neon-red rounded-full shadow-[0_0_8px_#ff003c]"
        style={{ top: '60%', left: '70%' }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2.5 }}
      />
      <motion.div 
        className="absolute w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_8px_#00f0ff]"
        style={{ top: '30%', left: '60%' }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
      />
    </div>
  );
};

export default RadarScanner;
