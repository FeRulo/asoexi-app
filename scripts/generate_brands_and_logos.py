import os
import json
import urllib.request
import time

BRANDS_DATA = [
    # SECTOR ELÉCTRICO (12)
    {
        "id": "panduit",
        "name": "Panduit",
        "sector": "electrico",
        "isTractor": True,
        "description": "Líder mundial en infraestructura de conectividad física, eléctrica y de red para centros de datos y plantas industriales.",
        "applicationNotes": "Soluciones de cableado estructurado Cat 6A, bandejas portacables, amarras de nylon resistentes a rayos UV y sistemas de puesta a tierra.",
        "productFamilies": ["Cableado Estructurado", "Bandejas Portacables", "Sistemas de Puesta a Tierra", "Amarras y Abrazaderas"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Panduit_logo.svg"
    },
    {
        "id": "colmena",
        "name": "Colmena",
        "sector": "electrico",
        "isTractor": False,
        "description": "Consorcio Metalúrgico Nacional líder en tubería conduit metálica y sistemas de canalización estructural bajo norma RETIE.",
        "applicationNotes": "Canalización y protección mecánica de conductores eléctricos en obras comerciales, industriales e infraestructura civil.",
        "productFamilies": ["Tubería Conduit Metálica EMT", "Tubería Conduit IMC", "Tubería Rígida Galvanizada", "Accesorios y Uniones"],
        "wiki_url": None
    },
    {
        "id": "proelectricos",
        "name": "Proeléctricos",
        "sector": "electrico",
        "isTractor": False,
        "description": "Fabricante colombiano especializado en cajas de paso, tableros de distribución y protecciones eléctricas certificadas.",
        "applicationNotes": "Instalaciones eléctricas industriales, acometidas, tableros de distribución secundaria y cajas estancas para ambientes agresivos.",
        "productFamilies": ["Cajas de Paso Metálicas", "Tableros de Distribución", "Tomas y Clavijas Industriales", "Interruptores Termomagnéticos"],
        "wiki_url": None
    },
    {
        "id": "centelsa",
        "name": "Centelsa by Nexans",
        "sector": "electrico",
        "isTractor": True,
        "description": "Líder en manufactura de cables y conductores eléctricos de cobre y aluminio con tecnología y respaldo global de Nexans.",
        "applicationNotes": "Líneas de transmisión, subestaciones eléctricas, cableado de potencia THHN/THWN-2, conductores concéntricos y cables armados.",
        "productFamilies": ["Cables de Potencia THHN/THWN-2", "Cables de Media y Alta Tensión", "Conductores Concéntricos", "Cables Flexibles de Cobre"],
        "wiki_url": None
    },
    {
        "id": "legrand",
        "name": "Legrand",
        "sector": "electrico",
        "isTractor": False,
        "description": "Especialista global en infraestructuras eléctricas y digitales para edificios terciarios, residenciales e industriales.",
        "applicationNotes": "Aparamenta modular, interruptores de caja moldeada, tomas e interruptores de alta gama, canalizaciones DLP y tableros.",
        "productFamilies": ["Aparamenta Modular", "Interruptores de Caja Moldeada", "Tomas e Interruptores Institucionales", "Canalización DLP"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Legrand_logo.svg"
    },
    {
        "id": "sylvania",
        "name": "Sylvania",
        "sector": "electrico",
        "isTractor": True,
        "description": "Soluciones integrales de iluminación profesional LED de alta eficiencia para áreas comerciales, industriales y residenciales.",
        "applicationNotes": "Paneles LED de incrustar, campanas industriales High Bay para bodegas, proyectores exteriores y tubos T8 de larga vida útil.",
        "productFamilies": ["Luminarias LED Industriales", "Paneles y Tubos LED", "Campanas High Bay", "Reflectores de Potencia"],
        "wiki_url": None
    },
    {
        "id": "mercury",
        "name": "Mercury",
        "sector": "electrico",
        "isTractor": False,
        "description": "Marca de iluminación LED confiable y competitiva para mantenimiento locativo, áreas comerciales y residenciales.",
        "applicationNotes": "Bombillería LED de alta rotación, paneles delgados de incrustar, reflectores para intemperie IP65 y sensores de presencia.",
        "productFamilies": ["Bombillería LED", "Reflectores Exteriores", "Paneles de Incrustar", "Sensores de Movimiento"],
        "wiki_url": None
    },
    {
        "id": "luminex",
        "name": "Luminex",
        "sector": "electrico",
        "isTractor": False,
        "description": "Conductores eléctricos especiales y cables libres de halógenos para infraestructura crítica y seguridad contra incendios.",
        "applicationNotes": "Circuitos de emergencia en centros comerciales, hospitales y áreas de evacuación bajo norma de baja emisión de humos.",
        "productFamilies": ["Cables Libres de Halógenos", "Cables para Instrumentación", "Cables de Control", "Conductores Especiales"],
        "wiki_url": None
    },
    {
        "id": "siemens",
        "name": "Siemens",
        "sector": "electrico",
        "isTractor": False,
        "description": "Líder tecnológico en automatización industrial, control y distribución eléctrica inteligente en baja y media tensión.",
        "applicationNotes": "Contactores SIRIUS, relés de sobrecarga, arrancadores suaves, guardamotores e interruptores automáticos para maquinaria pesada.",
        "productFamilies": ["Contactores SIRIUS", "Relés Térmicos", "Arrancadores Suaves", "Guardamotores y Breakers"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens-logo.svg"
    },
    {
        "id": "philips",
        "name": "Philips",
        "sector": "electrico",
        "isTractor": False,
        "description": "Líder mundial en iluminación técnica profesional LED con sistemas de alta reproducibilidad cromática y eficiencia lumínica.",
        "applicationNotes": "Alumbrado de líneas de ensamblaje, campanas GentleSpace para centros logísticos y proyectores viales y arquitectónicos.",
        "productFamilies": ["Tubos LED Master", "Campanas Industriales GentleSpace", "Proyectores de Iluminación", "Sistemas de Control Inteligente"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/5/52/Philips_logo_new.svg"
    },
    {
        "id": "lumec",
        "name": "Lumec",
        "sector": "electrico",
        "isTractor": False,
        "description": "Luminarias de alta gama para alumbrado público, zonas exteriores y grandes complejos logísticos e industriales de Signify.",
        "applicationNotes": "Iluminación perimetral de seguridad, vías de acceso privadas, parques industriales y plazas de maniobra.",
        "productFamilies": ["Luminarias de Alumbrado Público", "Postes y Brazos para Vías", "Luminarias Decorativas Urbanas", "Ópticas LED de Gran Alcance"],
        "wiki_url": None
    },
    {
        "id": "schneider",
        "name": "Schneider Electric",
        "sector": "electrico",
        "isTractor": False,
        "description": "Transformación digital de la gestión energética y automatización en hogares, edificios, centros de datos e industrias.",
        "applicationNotes": "Interruptores termomagnéticos Acti9, tableros Square D, contactores TeSys y variadores de frecuencia Altivar.",
        "productFamilies": ["Breakers Acti9", "Tableros Square D", "Contactores TeSys", "Variadores de Velocidad Altivar"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/9/95/Schneider_Electric_2007.svg"
    },

    # SECTOR FERRETERO & CONSTRUCCIÓN (14)
    {
        "id": "stanley",
        "name": "Stanley",
        "sector": "ferretero-construccion",
        "isTractor": True,
        "description": "Marca legendaria en herramientas manuales de alta precisión, almacenamiento y herramientas de medición profesional.",
        "applicationNotes": "Mantenimiento general en planta, ensamble mecánico, dotación de cuadrillas de instalación y obras de construcción.",
        "productFamilies": ["Herramientas Manuales", "Cintas Métricas de Alta Resistencia", "Juegos de Llaves y Copas", "Niveles Láser y Manuales"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Stanley_Black_%26_Decker_Logo.svg"
    },
    {
        "id": "truper",
        "name": "Truper",
        "sector": "ferretero-construccion",
        "isTractor": True,
        "description": "El mayor fabricante de herramientas de mano y equipos para construcción, ferretería pesada y jardinería en América Latina.",
        "applicationNotes": "Abastecimiento masivo para frentes de obra, movimientos de tierra, palas, carretillas y herramientas de golpe.",
        "productFamilies": ["Herramientas Agrícolas y de Construcción", "Palas y Carretillas", "Seguridad Industrial y EPP", "Herramientas de Corte y Golpe"],
        "wiki_url": None
    },
    {
        "id": "dewalt",
        "name": "DeWalt",
        "sector": "ferretero-construccion",
        "isTractor": True,
        "description": "Herramientas eléctricas y a batería de alto rendimiento para trabajo pesado continuo, perforación y corte certificado.",
        "applicationNotes": "Perforación intensiva en concreto y mampostería, corte de perfiles estructurales y fijación pesada en proyectos industriales.",
        "productFamilies": ["Rotomartillos SDS Plus y Max", "Pulidoras Angulares Industriales", "Taladros Percutores Inalámbricos XR", "Discos de Corte y Diamante"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/8/89/DeWalt_Logo.svg"
    },
    {
        "id": "total-tools",
        "name": "Total Tools",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Herramientas electroportátiles, manuales y accesorios con excelente relación costo-beneficio para instaladores y talleres.",
        "applicationNotes": "Dotación versátil para talleres de mantenimiento preventivo, cuadrillas livianas de montaje y cerrajería.",
        "productFamilies": ["Herramientas Electroportátiles", "Generadores a Gasolina", "Compresores Portátiles", "Accesorios y Consumibles"],
        "wiki_url": None
    },
    {
        "id": "bosch",
        "name": "Bosch",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Tecnología alemana en herramientas eléctricas profesionales Heavy Duty, demolición y medición láser de alta exactitud.",
        "applicationNotes": "Demolición pesada de losas, fijación química, corte de perfiles metálicos y nivelación óptica en obras civiles.",
        "productFamilies": ["Martillos Demoledores", "Amoladoras Profesionales Heavy Duty", "Medidores y Niveles Láser de Precisión", "Sierras Ingleteadoras"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/1/16/Bosch-logo.svg"
    },
    {
        "id": "argos",
        "name": "Argos",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Productor y comercializador líder de cemento gris, cemento blanco, morteros y concretos estructurales certificados.",
        "applicationNotes": "Fundición de estructuras de concreto reforzado, muros de contención, mampostería y mezclas secas para acabados.",
        "productFamilies": ["Cemento Gris Estructural Tipo UG", "Cemento Blanco Arquitectónico", "Morteros Secos y Concretos Listos", "Cal Hidratada"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/1/19/Cementos_Argos_logo.svg"
    },
    {
        "id": "cemex",
        "name": "Cemex",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Compañía global de materiales para la construcción de alta resistencia, soluciones para infraestructura y pavimentos.",
        "applicationNotes": "Cimentaciones profundas, placas de contrapiso industrial, pavimentos rígidos y prefabricados de alta durabilidad.",
        "productFamilies": ["Cemento Gris de Alta Resistencia", "Morteros de Pega y Pañete", "Agregados y Gravas Seleccionadas", "Concretos Especiales"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/0/03/Cemex_logo.svg"
    },
    {
        "id": "yale",
        "name": "Yale",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Referente mundial en cerrajería de seguridad, cerraduras electromecánicas, candados y control de acceso corporativo.",
        "applicationNotes": "Aseguramiento de puertas cortafuego, accesos institucionales, candados de alta seguridad para bodegas y cierrapuertas.",
        "productFamilies": ["Cerraduras de Embutir y Sobreponer", "Cerraduras Digitales e Inteligentes", "Candados de Alta Seguridad", "Cierrapuertas Hidráulicos"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Yale_Logo.svg"
    },
    {
        "id": "makita",
        "name": "Makita",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Ingeniería japonesa pionera en herramientas inalámbricas profesionales de 18V y 40V Max XGT para trabajo severo.",
        "applicationNotes": "Corte de metales con tronzadoras, caladoras de alta precisión, atornilladores de impacto y amoladoras para contratistas.",
        "productFamilies": ["Herramientas Inalámbricas LXT/XGT", "Tronzadoras de Metales", "Sierras Circulares y Caladoras", "Aspiradoras Industriales"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/7/71/Makita_Logo.svg"
    },
    {
        "id": "supermastick",
        "name": "Supermastick PR",
        "sector": "ferretero-construccion",
        "isTractor": True,
        "description": "Compuestos listos para juntas y masillas líderes para acabados lisos en sistemas de construcción liviana en seco (Drywall).",
        "applicationNotes": "Tratamiento de juntas en placas de yeso, encintado, acabado liso nivel 4 y 5 en muros interiores y cielos rasos.",
        "productFamilies": ["Masilla Lista para Drywall", "Compuestos para Juntas", "Cintas de Papel Microperforadas", "Esquineros y Perfiles de Remate"],
        "wiki_url": None
    },
    {
        "id": "irwin",
        "name": "Irwin Tools",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Herramientas de corte, perforación y fijación manual para profesionales del metalmecánico, plomería y carpintería.",
        "applicationNotes": "Perforación en aceros inoxidables con brocas cobalto, prensado con alicates Vise-Grip y corte con hojas de sierra bi-metálicas.",
        "productFamilies": ["Brocas de Cobalto y Titanio", "Prensas Rápidas Quick-Grip", "Alicates de Presión Vise-Grip", "Hojas de Sierra Sable y Caladora"],
        "wiki_url": None
    },
    {
        "id": "eternit",
        "name": "Eternit",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Líder en cubiertas de fibrocemento, tanques para agua, placas planas y soluciones constructivas para edificaciones.",
        "applicationNotes": "Techado de bodegas y naves industriales, tanques de almacenamiento de agua potable y fachadas en placa plana Eterboard.",
        "productFamilies": ["Tejas Onduladas de Fibrocemento", "Cubiertas Arquitectónicas", "Tanques de Polietileno para Almacenamiento", "Placas Planas Eterboard"],
        "wiki_url": None
    },
    {
        "id": "knauf",
        "name": "Knauf",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Sistemas completos de placas de yeso, perfilería galvanizada y aislamiento termoacústico para construcción en seco.",
        "applicationNotes": "Tabiques divisorios con resistencia al fuego (RF), placas resistentes a la humedad (RH) para zonas húmedas y cielos rasos acústicos.",
        "productFamilies": ["Placas de Yeso Estándar", "Placas Antihumedad (RH) y Cortafuego (RF)", "Perfiles Metálicos Drywall", "Masillas y Fijaciones Especiales"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/2/2c/KNAUF_Logo_2024.svg"
    },
    {
        "id": "gyplac",
        "name": "Gyplac",
        "sector": "ferretero-construccion",
        "isTractor": False,
        "description": "Placas de yeso-cartón y soluciones modulares para cielo rasos y divisiones interiores en proyectos institucionales.",
        "applicationNotes": "Divisiones de oficinas, cerramientos interiores rápidos, cielos rasos suspendidos y aislamiento acústico interior.",
        "productFamilies": ["Placas de Yeso-Cartón Gyplac", "Cielos Rasos Desmontables", "Cintas y Masillas de Juntas", "Tornillería Autoperforante"],
        "wiki_url": None
    },

    # SECTOR HIDRÁULICO & PINTURAS (18)
    {
        "id": "pavco-wavin",
        "name": "Pavco Wavin",
        "sector": "hidraulico-pinturas",
        "isTractor": True,
        "description": "Líder indiscutible en soluciones de conducción y manejo de fluidos en tubería y accesorios de PVC, CPVC y PPR en Colombia.",
        "applicationNotes": "Redes hidrosanitarias domiciliarias e industriales, colectores pluviales, acueducto a presión y termofusión para agua caliente.",
        "productFamilies": ["Tubería Sanitaria y Aguas Lluvias", "Tubería Presión RDE para Acueducto", "Sistemas de Termofusión PPR", "Accesorios y Pegantes PVC"],
        "wiki_url": None
    },
    {
        "id": "corona",
        "name": "Corona",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Multinacional colombiana líder en porcelana sanitaria, griferías institucionales, revestimientos cerámicos y pegantes especializados.",
        "applicationNotes": "Equipamiento de baños de alto tráfico para centros comerciales, hospitales y colegios con bajo consumo de agua.",
        "productFamilies": ["Sanitarios Institucionales de Bajo Consumo", "Griferías para Baño y Cocina", "Lavamanos y Orinales Ecológicos", "Pegantes Cerámicos y Boquillas"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Corona_%28Colombia%29_logo.svg"
    },
    {
        "id": "pintuco",
        "name": "Pintuco",
        "sector": "hidraulico-pinturas",
        "isTractor": True,
        "description": "Compañía de pinturas y recubrimientos de alto rendimiento para el sector arquitectónico, industrial, marítimo y automotriz.",
        "applicationNotes": "Protección de estructuras metálicas con anticorrosivos epóxicos, pisos industriales, vinilos lavables y pinturas de demarcación vial.",
        "productFamilies": ["Pinturas Epóxicas y Poliuretanos", "Vinilos Lavables Tipo 1 Koraza", "Esmaltes Anticorrosivos Pintulux", "Pinturas de Demarcación Vial"],
        "wiki_url": None
    },
    {
        "id": "tito-pabon",
        "name": "Pinturas Tito Pabón",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Fabricante colombiano de pinturas y esmaltes con fórmulas ecológicas de bajo olor y excelente poder cubriente.",
        "applicationNotes": "Mantenimiento locativo de fachadas, interiores de oficinas, acabado protector en carpintería metálica y maderas.",
        "productFamilies": ["Vinilos Arquitectónicos Tipo 1", "Esmaltes Sintéticos Anticorrosivos", "Pinturas para Fachadas e Impermeabilizantes", "Barnices para Maderas"],
        "wiki_url": None
    },
    {
        "id": "goya",
        "name": "Goya",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Herramientas especializadas para la aplicación profesional de pintura, rodillos de alta densidad, brochas y complementos.",
        "applicationNotes": "Acabados sin salpicaduras en grandes superficies, aplicación de epóxicos y esmaltes con rodillos de microfibra y pelo corto.",
        "productFamilies": ["Rodillos Profesionales Antigota", "Brochas de Cerda Natural y Sintética", "Espátulas Metálicas y Llanas", "Bandejas y Alargadores"],
        "wiki_url": None
    },
    {
        "id": "caribe",
        "name": "Caribe",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Línea de herramientas de mano y albañilería pesada para mampostería, pañete, nivelación de pisos y acabados.",
        "applicationNotes": "Palustres forjados, llanas dentadas para enchapes cerámicos, cinceles y niveles de gota para maestros de obra.",
        "productFamilies": ["Palas Forjadas Cuadradas y Redondas", "Llanas Lisas y Dentadas", "Palustres y Cinceles de Albañilería", "Picos y Barretas"],
        "wiki_url": None
    },
    {
        "id": "helbert",
        "name": "Helbert",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Bombas centrífugas, eyectoras y sistemas hidroneumáticos para elevación y presurización de agua en edificaciones.",
        "applicationNotes": "Cuartos de bombeo en edificios residenciales e industriales, extracción de pozos y recirculación de agua limpia.",
        "productFamilies": ["Bombas Centrífugas Monobloque", "Bombas Sumergibles para Pozo Profundo", "Equipos Eyectores", "Tanques Hidroneumáticos"],
        "wiki_url": None
    },
    {
        "id": "evans",
        "name": "Evans",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Equipos de bombeo de agua, generación de energía y compresores de aire para soporte industrial y agrícola.",
        "applicationNotes": "Sistemas de presión constante con variador, respaldo eléctrico para plantas en obra y aire comprimido para herramientas neumáticas.",
        "productFamilies": ["Sistemas Hidroneumáticos de Presión Constante", "Compresores de Aire Lubricados y Libres de Aceite", "Plantas Eléctricas a Gasolina y Diésel", "Motobombas Autocebantes"],
        "wiki_url": None
    },
    {
        "id": "durman",
        "name": "Durman",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Sistemas avanzados de tuberías y conexiones plásticas de Aliaxis para acueducto, alcantarillado e instalaciones sanitarias.",
        "applicationNotes": "Drenajes pluviales de gran caudal, redes de desagüe sanitario bajo norma NTC y distribución de agua potable.",
        "productFamilies": ["Tubería PVC Sanitaria y Ventilación", "Tubería CPVC para Agua Caliente", "Válvulas y Conexiones Especiales", "Sistemas de Drenaje Subterráneo"],
        "wiki_url": None
    },
    {
        "id": "pcp",
        "name": "PCP",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Válvulas y accesorios plásticos para control de fluidos en acometidas domiciliarias, redes de agua y griferías.",
        "applicationNotes": "Válvulas de bola en PVC de paso total, llaves de jardín y accesorios de acople rápido para plomería residencial e institucional.",
        "productFamilies": ["Válvulas de Bola en PVC Roscadas y Soldar", "Griferías Plásticas para Lavamanos y Lavaplatos", "Llaves de Jardín y Terminales", "Mangueras Flexibles y Acoples"],
        "wiki_url": None
    },
    {
        "id": "3m",
        "name": "3M",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Tecnología aplicada en cintas aislantes eléctricas, abrasivos de alto rendimiento, adhesivos estructurales y seguridad industrial.",
        "applicationNotes": "Aislamiento dieléctrico con cintas Scotch 33+, empalmes subterráneos, desbaste con discos Cubitron y mascarillas de protección N95.",
        "productFamilies": ["Cintas Eléctricas Scotch 33+ y Temflex", "Abrasivos y Discos de Desbaste Cubitron", "Cintas Doble Faz VHB de Montaje", "Respiradores y EPP Certificado"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/1/15/3M_wordmark.svg"
    },
    {
        "id": "multipack",
        "name": "Multipack",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Cintas de teflón, selladores de roscas y empaquetaduras técnicas para uniones hidráulicas y de gas sin fugas.",
        "applicationNotes": "Sellado hermético de uniones roscadas metálicas y plásticas en redes de agua potable, gas natural y fluidos industriales.",
        "productFamilies": ["Cintas de Teflón Industrial para Plomería", "Selladores de Roscas Hidráulicas y de Gas", "Empaques y O-Rings de Caucho", "Juntas de Sellado para Bridas"],
        "wiki_url": None
    },
    {
        "id": "tesa",
        "name": "Tesa",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Cintas adhesivas técnicas y soluciones de fijación para la industria manufacturera, automotriz, construcción y pintura.",
        "applicationNotes": "Enmascarado de precisión en pintura arquitectónica, fijación de canaletas y perfiles sin taladro con cintas de montaje de alta adhesión.",
        "productFamilies": ["Cintas Adhesivas de Doble Faz Industrial", "Cintas para Enmascarado de Alta Temperatura", "Cintas de Embalaje y Marcación de Pisos", "Cintas de Reparación Ultra Resistentes"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Tesa_SE_logo.svg"
    },
    {
        "id": "tvr",
        "name": "TVR",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Válvulas de bronce, registros de corte y accesorios hidrosanitarios de alta durabilidad para redes hidráulicas y gas.",
        "applicationNotes": "Llaves de paso en acometidas, cuartos de medidores de agua, cheques de cortina y flotadores para tanques de almacenamiento.",
        "productFamilies": ["Válvulas de Registro en Bronce y Latón", "Llaves de Paso para Agua y Gas", "Cheques de Cortina y Retención", "Flotadores y Válvulas de Admisión"],
        "wiki_url": None
    },
    {
        "id": "sika",
        "name": "Sika",
        "sector": "hidraulico-pinturas",
        "isTractor": True,
        "description": "Compañía química suiza líder en impermeabilización, sellado, amortiguación, refuerzo y protección de estructuras.",
        "applicationNotes": "Impermeabilización de cubiertas, sellado de juntas con Sikaflex, aditivos para concreto y morteros de reparación estructural SikaTop.",
        "productFamilies": ["Impermeabilizantes Acrílicos y Asfálticos", "Selladores de Poliuretano Sikaflex", "Aditivos Acelerantes y Plastificantes para Concreto", "Morteros de Reparación Estructural SikaTop"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/5/56/Logo_Sika_AG.svg"
    },
    {
        "id": "grival",
        "name": "Grival",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Griferías de calidad superior, repuestos originales y sistemas hidrosanitarios para baños, cocinas e instalaciones institucionales.",
        "applicationNotes": "Griferías temporizadas antivandálicas para áreas públicas, fluxómetros, repuestos de vástagos y cartuchos de cierre cerámico.",
        "productFamilies": ["Griferías Monocontrol y Mezcladores", "Fluxómetros para Sanitarios y Orinales", "Repuestos Originales de Válvulas y Cartuchos", "Griferías Temporizadas Institucionales"],
        "wiki_url": None
    },
    {
        "id": "toto",
        "name": "TOTO",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Líder mundial en tecnología sanitaria, aparatos de bajo consumo de agua, fluxómetros automáticos y griferías ecológicas.",
        "applicationNotes": "Edificaciones sustentables con certificación LEED, hoteles corporativos y sedes bancarias con sistemas touchless.",
        "productFamilies": ["Sanitarios de Ultra Alta Eficiencia (UHET)", "Fluxómetros Electrónicos Automáticos", "Griferías Sensorizadas Touchless", "Urinarios Ecológicos sin Agua"],
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/e/e2/TOTO_logo.svg"
    },
    {
        "id": "docol",
        "name": "Docol",
        "sector": "hidraulico-pinturas",
        "isTractor": False,
        "description": "Metales sanitarios de alta ingeniería y durabilidad, griferías con temporizador hidromecánico e higiene certificada.",
        "applicationNotes": "Equipamiento antivandálico para baños de estadios, colegios y empresas con griferías de corte automático DocolPress.",
        "productFamilies": ["Metales Sanitarios Institucionales", "Griferías Hidromecánicas Temporizadas DocolPress", "Válvulas de Descarga Antivandálicas", "Accesorios en Acero Inoxidable"],
        "wiki_url": None
    }
]

CUSTOM_SVGS = {
    "colmena": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <path d="M 40 25 L 80 25 L 90 40 L 80 55 L 40 55 L 30 40 Z" fill="none" stroke="#222" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 50 32 L 70 32 L 76 40 L 70 48 L 50 48 L 44 40 Z" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
  <text x="105" y="44" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="22" letter-spacing="1.5" fill="#1E2229">COLMENA</text>
  <rect x="105" y="52" width="125" height="14" fill="#F59E0B" rx="2"/>
  <text x="167" y="63" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="8.5" fill="#111" text-anchor="middle" letter-spacing="0.5">ACERO EN EVOLUCIÓN</text>
</svg>''',

    "proelectricos": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80">
  <path d="M 20 50 L 35 26 L 55 26 C 65 26 70 32 65 42 L 60 50 Z" fill="none" stroke="#E51A24" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 32 38 L 50 38" stroke="#E51A24" stroke-width="3"/>
  <text x="75" y="44" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="20" letter-spacing="1" fill="#C8101A">PROELECTRICOS</text>
  <text x="75" y="60" font-family="'Brush Script MT', cursive, sans-serif" font-style="italic" font-size="12" fill="#555">Seguridad para tus proyectos</text>
</svg>''',

    "centelsa": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80">
  <g transform="translate(15, 18)">
    <path d="M 0 35 L 20 5 L 35 5 L 20 20 L 35 20 L 15 45 Z" fill="#E51A24"/>
    <path d="M 8 45 L 28 15 L 42 15 L 26 38 Z" fill="#1E2229"/>
  </g>
  <text x="68" y="42" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-style="italic" font-size="23" letter-spacing="1" fill="#1E2229">CENTELSA</text>
  <text x="110" y="60" font-family="Arial, Helvetica, sans-serif" font-size="13" font-style="italic" fill="#555">by </text>
  <text x="130" y="60" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="15" fill="#E51A24">Nexans</text>
</svg>''',

    "sylvania": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="120" y="52" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-style="italic" font-size="33" letter-spacing="1" fill="#00887A" text-anchor="middle">SYLVANIA</text>
</svg>''',

    "mercury": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="30" y="45" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="24" letter-spacing="1" fill="#1E2229">MERC</text>
  <!-- stylized bulb O -->
  <g transform="translate(120, 22)">
    <circle cx="12" cy="14" r="10" fill="#F59E0B"/>
    <path d="M 8 22 L 16 22 L 14 27 L 10 27 Z" fill="#777"/>
    <line x1="12" y1="2" x2="12" y2="-2" stroke="#F59E0B" stroke-width="2"/>
    <line x1="2" y1="6" x2="-1" y2="3" stroke="#F59E0B" stroke-width="2"/>
    <line x1="22" y1="6" x2="25" y2="3" stroke="#F59E0B" stroke-width="2"/>
  </g>
  <text x="150" y="45" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="24" letter-spacing="1" fill="#1E2229">RY</text>
  <text x="120" y="62" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="8.5" fill="#777" letter-spacing="1" text-anchor="middle">SIEMPRE COMPETITIVO</text>
</svg>''',

    "luminex": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80">
  <rect x="25" y="15" width="40" height="40" fill="#1E2229" rx="3"/>
  <!-- sunburst rays -->
  <g transform="translate(45, 35)">
    <circle cx="0" cy="0" r="4" fill="#E51A24"/>
    <line x1="0" y1="-14" x2="0" y2="14" stroke="#E51A24" stroke-width="2.5"/>
    <line x1="-14" y1="0" x2="14" y2="0" stroke="#E51A24" stroke-width="2.5"/>
    <line x1="-10" y1="-10" x2="10" y2="10" stroke="#E51A24" stroke-width="2"/>
    <line x1="-10" y1="10" x2="10" y2="-10" stroke="#E51A24" stroke-width="2"/>
  </g>
  <text x="75" y="42" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="23" letter-spacing="2" fill="#1E2229">LUMINEX</text>
</svg>''',

    "lumec": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80">
  <text x="30" y="44" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="26" letter-spacing="2" fill="#0C4A6E">LUMEC</text>
  <text x="32" y="60" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#64748B">by </text>
  <text x="52" y="60" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="13" fill="#0C4A6E">Signify</text>
</svg>''',

    "total-tools": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80">
  <rect x="15" y="24" width="230" height="34" fill="#E51A24" rx="4" transform="skewX(-12)"/>
  <circle cx="35" cy="41" r="12" fill="#F59E0B" stroke="#FFF" stroke-width="2"/>
  <text x="60" y="48" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-style="italic" font-size="22" letter-spacing="1" fill="#FFFFFF">TOTAL TOOLS</text>
</svg>''',

    "truper": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <g transform="translate(15, 22)">
    <!-- Truper double semi-oval logo mark -->
    <path d="M 12 8 C 5 8 0 14 0 20 C 0 26 5 32 12 32 C 16 32 20 29 23 25 C 20 23 18 20 18 20 C 18 20 20 17 23 15 C 20 11 16 8 12 8 Z" fill="#EA580C"/>
    <path d="M 34 8 C 41 8 46 14 46 20 C 46 26 41 32 34 32 C 30 32 26 29 23 25 C 26 23 28 20 28 20 C 28 20 26 17 23 15 C 26 11 30 8 34 8 Z" fill="#EA580C"/>
  </g>
  <text x="75" y="49" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="28" letter-spacing="2" fill="#EA580C">TRUPER</text>
</svg>''',

    "supermastick": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80">
  <rect x="10" y="22" width="260" height="38" fill="#C8101A" rx="4"/>
  <rect x="14" y="26" width="252" height="30" fill="none" stroke="#F59E0B" stroke-width="2" rx="2"/>
  <text x="125" y="48" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="21" letter-spacing="1" fill="#FFFFFF" text-anchor="middle">SUPERMASTICK</text>
  <rect x="226" y="29" width="32" height="24" fill="#F59E0B" rx="2"/>
  <text x="242" y="46" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="14" fill="#C8101A" text-anchor="middle">PR</text>
</svg>''',

    "irwin": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="120" y="44" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="34" letter-spacing="1" fill="#1E3A8A" text-anchor="middle">IRWIN</text>
  <line x1="45" y1="52" x2="195" y2="52" stroke="#1E3A8A" stroke-width="3"/>
  <text x="120" y="65" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="10" letter-spacing="3" fill="#1E3A8A" text-anchor="middle">TOOLS</text>
</svg>''',

    "eternit": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <rect x="15" y="18" width="210" height="46" fill="#C8101A" rx="4"/>
  <g transform="translate(32, 28)">
    <path d="M 0 18 L 8 6 L 14 6 L 6 18 Z" fill="#FFF"/>
    <path d="M 12 18 L 20 6 L 26 6 L 18 18 Z" fill="#FFF"/>
  </g>
  <text x="75" y="49" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="26" fill="#FFFFFF">Eternit</text>
</svg>''',

    "gyplac": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <g transform="translate(20, 22)">
    <path d="M 18 6 L 36 15 L 36 27 L 18 36 L 0 27 L 0 15 Z" fill="none" stroke="#10B981" stroke-width="5" stroke-linejoin="round"/>
    <path d="M 18 20 L 28 25 L 28 31" fill="none" stroke="#10B981" stroke-width="4" stroke-linejoin="round"/>
  </g>
  <text x="72" y="50" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="32" letter-spacing="0.5" fill="#475569">Gyplac</text>
</svg>''',

    "pavco-wavin": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="120" y="38" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="28" letter-spacing="1" fill="#0C4A6E" text-anchor="middle">PAVCO</text>
  <rect x="65" y="45" width="110" height="22" rx="11" fill="#38BDF8"/>
  <text x="120" y="61" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="16" letter-spacing="0.5" fill="#0C4A6E" text-anchor="middle">wavin</text>
</svg>''',

    "pintuco": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80">
  <ellipse cx="130" cy="40" rx="110" ry="32" fill="#FDE047" stroke="#CA8A04" stroke-width="2"/>
  <text x="130" y="46" font-family="'Trebuchet MS', Arial, sans-serif" font-weight="900" font-style="italic" font-size="28" fill="#DC2626" text-anchor="middle">Pintuco</text>
  <text x="130" y="62" font-family="Arial, sans-serif" font-weight="600" font-size="8.5" fill="#1E2229" text-anchor="middle">El Color de la Calidad</text>
</svg>''',

    "tito-pabon": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80">
  <ellipse cx="130" cy="40" rx="105" ry="30" fill="#DC2626"/>
  <text x="130" y="34" font-family="Arial, sans-serif" font-weight="800" font-size="10" fill="#FFF" letter-spacing="2" text-anchor="middle">PINTURAS</text>
  <text x="130" y="56" font-family="'Brush Script MT', cursive, sans-serif" font-size="24" fill="#FFF" text-anchor="middle">Tito Pabón</text>
</svg>''',

    "goya": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="120" y="46" font-family="Georgia, serif" font-weight="900" font-style="italic" font-size="34" fill="#1D4ED8" text-anchor="middle">Goya</text>
  <text x="120" y="62" font-family="Arial, sans-serif" font-size="9" font-style="italic" fill="#555" text-anchor="middle">La aplicación perfecta</text>
</svg>''',

    "caribe": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 80">
  <g transform="translate(15, 20)">
    <rect x="4" y="4" width="24" height="24" rx="4" fill="#65A30D"/>
    <path d="M 12 12 L 20 12 L 20 20 L 12 20 Z" fill="#FFF"/>
  </g>
  <text x="55" y="42" font-family="Arial, sans-serif" font-weight="900" font-size="22" letter-spacing="1" fill="#4D7C0F">CARIBE</text>
  <text x="56" y="56" font-family="Arial, sans-serif" font-weight="700" font-size="7.5" fill="#666" letter-spacing="0.5">HERRAMIENTA EN SUS MANOS</text>
</svg>''',

    "helbert": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <rect x="25" y="26" width="30" height="28" fill="#F59E0B" rx="3"/>
  <polygon points="36,33 46,40 36,47" fill="#111"/>
  <text x="65" y="49" font-family="Arial, sans-serif" font-weight="900" font-size="26" letter-spacing="2" fill="#111">HELBERT</text>
</svg>''',

    "evans": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <ellipse cx="120" cy="40" rx="85" ry="26" fill="#EA580C"/>
  <text x="120" y="49" font-family="Arial, sans-serif" font-weight="900" font-size="26" letter-spacing="2" fill="#FFFFFF" text-anchor="middle">EVANS</text>
</svg>''',

    "durman": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="120" y="52" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="36" letter-spacing="0.5" fill="#DC2626" text-anchor="middle">Durman</text>
</svg>''',

    "pcp": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="120" y="46" font-family="Arial, sans-serif" font-weight="900" font-size="34" letter-spacing="1" fill="#0284C7" text-anchor="middle">PCP</text>
  <text x="120" y="62" font-family="Arial, sans-serif" font-style="italic" font-size="10" fill="#0369A1" text-anchor="middle">Ideas que Fluyen</text>
</svg>''',

    "multipack": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="35" y="54" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#DC2626">M</text>
  <text x="80" y="48" font-family="Arial, sans-serif" font-weight="800" font-size="22" letter-spacing="1" fill="#DC2626">ultipack</text>
</svg>''',

    "tvr": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <!-- metallic striped TVR style -->
  <text x="120" y="52" font-family="Arial, sans-serif" font-weight="900" font-size="38" letter-spacing="4" fill="#334155" text-anchor="middle">TVR</text>
</svg>''',

    "grival": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="120" y="52" font-family="Arial, sans-serif" font-weight="900" font-size="34" letter-spacing="2" fill="#0F766E" text-anchor="middle">GRIVAL</text>
</svg>''',

    "docol": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80">
  <text x="40" y="45" font-family="Arial, sans-serif" font-weight="900" font-size="28" letter-spacing="2" fill="#1E2229">DOCOL</text>
  <g transform="translate(170, 20)">
    <path d="M 0 10 Q 10 0 20 10 T 40 10" fill="none" stroke="#0284C7" stroke-width="4"/>
    <path d="M 0 18 Q 10 8 20 18 T 40 18" fill="none" stroke="#38BDF8" stroke-width="4"/>
  </g>
  <text x="42" y="60" font-family="Arial, sans-serif" font-weight="600" font-size="9" letter-spacing="1" fill="#64748B">METAIS SANITÁRIOS</text>
</svg>'''
}

WORKTREE_DIR = "/home/fernando/Fernando/Own/asoexi-app-marcas"
BRANDS_DIR = os.path.join(WORKTREE_DIR, "src/content/brands")
PUBLIC_BRANDS_DIR = os.path.join(WORKTREE_DIR, "public/brands")

os.makedirs(BRANDS_DIR, exist_ok=True)
os.makedirs(PUBLIC_BRANDS_DIR, exist_ok=True)

print(f"Iniciando generación de {len(BRANDS_DATA)} marcas y logotipos...")

downloaded_count = 0
custom_count = 0

for brand in BRANDS_DATA:
    b_id = brand["id"]
    svg_filename = f"{b_id}.svg"
    svg_path = os.path.join(PUBLIC_BRANDS_DIR, svg_filename)
    
    # 1. Intentar descargar si hay wiki_url
    download_success = False
    if brand.get("wiki_url"):
        try:
            req = urllib.request.Request(
                brand["wiki_url"],
                headers={"User-Agent": "AsoexiWebBuild/1.0 (contacto@asoexi.com)"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                content = resp.read()
                if len(content) > 200 and b"<svg" in content:
                    with open(svg_path, "wb") as f:
                        f.write(content)
                    print(f"  [DOWNLOAD] {b_id}: {len(content)} bytes desde Wikimedia")
                    download_success = True
                    downloaded_count += 1
            time.sleep(0.5)
        except Exception as e:
            print(f"  [FALLBACK] Error descargando {b_id} ({e}), usando SVG vectorial corporativo")

    # 2. Si no se descargó o no tenía wiki_url, usar SVG vectorial específico
    if not download_success:
        if b_id in CUSTOM_SVGS:
            svg_content = CUSTOM_SVGS[b_id]
        else:
            # Fallback limpio corporativo de alta calidad
            display_name = brand["name"]
            svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
  <text x="120" y="48" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="26" letter-spacing="1.5" fill="#1E2229" text-anchor="middle">{display_name.upper()}</text>
</svg>'''
        with open(svg_path, "w", encoding="utf-8") as f:
            f.write(svg_content.strip() + "\n")
        print(f"  [VECTOR] {b_id}: SVG vectorial de alta resolución creado")
        custom_count += 1

    # 3. Guardar / actualizar el archivo JSON en src/content/brands/
    json_path = os.path.join(BRANDS_DIR, f"{b_id}.json")
    brand_record = {
        "id": b_id,
        "name": brand["name"],
        "sector": brand["sector"],
        "isTractor": brand["isTractor"],
        "logo": f"/brands/{svg_filename}",
        "description": brand["description"],
        "applicationNotes": brand["applicationNotes"],
        "pdfCatalogUrl": None,
        "productFamilies": brand["productFamilies"]
    }
    
    with open(json_path, "w", encoding="utf-8") as jf:
        json.dump(brand_record, jf, indent=2, ensure_ascii=False)
        jf.write("\n")

print(f"\nGeneración completada exitosamente:")
print(f"- Total marcas procesadas: {len(BRANDS_DATA)}")
print(f"- SVGs descargados de Wikimedia: {downloaded_count}")
print(f"- SVGs vectoriales corporativos: {custom_count}")
print(f"- Directorio JSON: {BRANDS_DIR}")
print(f"- Directorio SVGs: {PUBLIC_BRANDS_DIR}")
