

export const colors = {
  
  brand: {
    primary: '#1D5BD8',     
    primaryHover: '#1749AC', 
    primaryLight: '#EFF6FF', 
    primaryBorder: '#BFDBFE',
  },

  // Menu Lateral
  sidebar: {
    background: '#0B132B',  
    surface: '#111C44',      
    hover: '#172554',       
    active: '#1D5BD8',      
    text: '#94A3B8',         
    textHover: '#FFFFFF',    
    textActive: '#FFFFFF',   
    badge: '#EF4444',        
    footerText: '#64748B',   
  },

  // Header Superior
  header: {
    background: '#1D5BD8',  
    text: '#FFFFFF',         
    roleText: '#DBEAFE',     
    badge: '#EF4444',       
  },

  // Tipografia / Neutros
  text: {
    primary: '#0F172A',      
    secondary: '#475569',    
    muted: '#94A3B8',       
    inverted: '#FFFFFF',     
  },


  // Níveis de Prioridade das Oportunidades
  priority: {
    alta: '#EF4444',   
    media: '#F59E0B',  
    baixa: '#10B981',  
  },

  // Alertas e Mensagens
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    alertCardBg: '#FEF2F2',
    alertCardBorder: '#FECACA', 
    alertCardText: '#DC2626',   
  },
} as const;