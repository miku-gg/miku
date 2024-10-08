import { EMOTION_GROUP_TEMPLATES } from '@mikugg/bot-utils';
import { AbstractPromptStrategy, fillTextTemplate } from '..';
import {
  selectAllParentDialoguesWhereCharactersArePresent,
  selectCurrentCharacterOutfits,
} from '../../../../state/selectors';
import { RootState } from '../../../../state/store';
import { NarrationInteraction, NarrationResponse } from '../../../../state/versioning';
import { NarrationSummarySentence } from '../../../../state/versioning/v3.state';

const PROMPT_TOKEN_OFFSET = 50;

export class SummaryPromptStrategy extends AbstractPromptStrategy<
  {
    state: RootState;
    characterIds: string[];
    sentencesToGenerate: number;
    excludeLastResponse?: boolean;
  },
  NarrationResponse
> {
  protected getLabels(): Record<string, Record<string, string>> {
    const labels: Record<string, Record<string, string>> = {
      en: {
        summary_intro:
          'You are an expert screenwriter. Your task is to summarize a story into sentences extracting the most valuable information to remember.',
        summary_instructions:
          'Respond only with CHRONOLOGICAL set of sentences that summarize the story. Include important details, but keep it concise.',
        colorful_details: 'Colorful and interesting details about characters should also be a single sentence.',
        importance_instructions: 'Include each sentence IMPORTANCE from 1 to 5 in parentheses.',
        sentence_limit: 'ONLY give no more than 10 short sentences.',
        examples:
          'Examples: "% likes to play football (importance=3)" or "% and % visited the park together (importance=2)"',
        summary_of_story: 'Here is the summary for "CONVERSATION #%", in chronological order, in % sentences:',
        characters: 'CHARACTERS: % and %.',
        shot_example: `CONVERSATION #1:\n{{char}}: *As {{char}} approaches and see you, blushing slightly, she returns his smile.* Hey, {{user}}! I'm glad we could have this date today. You're looking great, by the way. *With a mischievous smirk, she leads him towards their destination.* You just wait and see, {{user}}. I've planned something special for us today. But first, let's enjoy each other's company and make this date unforgettable.\n{{user}}: what's the plan\n{{char}}'s reaction: excited\n{{char}}: *Her eyes sparkle with anticipation as she reveals her plans.* Well, {{user}}, since you love Japanese culture and cuisine, I thought we'd start at this traditional tea ceremony house nearby. We'll learn the art of preparing matcha tea while dressed in kimonos - it'll be such a romantic setting!\n*She continues enthusiastically,* After that, we'll take a stroll through the picturesque bamboo forest trail. Imagine the rustling leaves and dappled sunlight creating a magical ambiance as we walk hand-in-hand. Then, for dinner, I've reserved a private room at a renowned tempura restaurant overlooking the city lights. We can savor delicious seafood tempura and sake while enjoying the breathtaking view.\n*{{char}} moves closer, her voice softening.* And finally...if you're up for it, we could end the night at my place for some late-night snacks and cuddles under the stars on my balcony.\n{{user}}: alright, let go then...\n{{char}}'s reaction: happy\n{{char}}: *Beaming with joy, {{char}} links arms with {{user}}.* Perfect! I knew you'd appreciate the cultural experiences I planned. Let's begin our adventure!\n*They arrive at the tea ceremony house, where a friendly hostess greets them and helps them change into elegant kimonos. {{char}} feels giddy wearing the flowing silk garment, its vibrant colors complementing her features.*\n*The hostess guides them to a cozy tatami mat room adorned with delicate flower arrangements. As they sit cross-legged facing each other, {{char}} watches intently as {{user}} learns the graceful motions of whisking the green powder into hot water. His concentration is adorable!*\n*After sipping the frothy matcha, {{char}} leans in close, her breath tickling {{user}}'s ear.* See? Isn't this romantic? Sitting here in these beautiful robes, sharing a moment of tranquility together.\n{{user}}: what is this unconfortable shit, i don't like it\n{{char}}'s reaction: confused\n{{char}}: *{{char}} tilts her head quizzically, unsure why {{user}} seems uncomfortable.* What do you mean, {{user}}? Is everything okay? I thought you would enjoy experiencing a traditional Japanese tea ceremony. The kimono feels a bit strange at first, but it grows on you after a while.\n*She reaches out to gently touch his arm, her brow furrowed with concern.* If you're feeling genuinely uncomfortable though, we don't have to continue. Your comfort is important to me above all else. Perhaps we could try something else instead? There are plenty of other activities we could explore together during our date.\n{{user}}: nah it's fine. let's go to a grocery store first, i want some water\n{{char}}'s reaction: disappointed\n{{char}}: *{{char}}'s face falls slightly, disappointment evident in her expressive features. She takes a deep breath, trying to mask her feelings behind a polite smile.*\nOf course, {{user}}. Whatever makes you comfortable. A quick trip to the grocery store sounds nice actually. Some refreshments will probably hit the spot after sitting still for the tea ceremony.\n*She gracefully rises from the floor, smoothing down her colorful kimono. With practiced ease, she slips off the wooden geta sandals provided earlier and slides back into her regular shoes. {{char}} pauses briefly to adjust her obi belt, ensuring the traditional outfit remains neat despite the unexpected detour.*\nLead the way, {{user}}. I trust you know a good local market. And please, don't hesitate to speak up if anything doesn't suit you. My goal is for us to share a wonderful day together, whatever form that may take.`,
        shot_example_response: `{{char}} and {{user}} meet up for a pre-planned date in Japan. (importance=3)\n{{char}} and {{user}} visit a traditional tea ceremony house where they wear kimonos. (importance=2)\n{{user}} expresses discomfort with kimonos. (importance=2)\n{{user}} suggests visiting a grocery store. (importance=1)\n{{char}} is disappointed but agrees to go the grocery store. (importance=1)`,
        importance: 'importance',
        conversation_2: 'CONVERSATION #2:',
      },
      es_es: {
        summary_intro:
          'Eres un guionista experto. Tu tarea es resumir una historia en frases extrayendo la información más valiosa para recordar.',
        summary_instructions:
          'Responde solo con un conjunto CRONOLÓGICO de frases que resuman la historia. Incluye detalles importantes, pero mantén la concisión.',
        colorful_details:
          'Los detalles coloridos e interesantes sobre los personajes también deben ser una sola frase.',
        importance_instructions: 'Incluye la IMPORTANCIA de cada frase del 1 al 5 entre paréntesis.',
        sentence_limit: 'Da SOLO un máximo de 10 frases cortas.',
        examples:
          'Ejemplos: "A % le gusta jugar al fútbol (importancia=3)" o "% y % visitaron el parque juntos (importancia=2)"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'PERSONAJES: % y %.',
        shot_example: `CONVERSACIÓN #1:\n{{char}}: *Mientras {{char}} se acerca y te ve, sonrojándose ligeramente, te devuelve la sonrisa.* ¡Hola, {{user}}! Me alegro de que pudiéramos tener esta cita hoy. Por cierto, te ves genial. *Con una sonrisa traviesa, te guía hacia vuestro destino.* Ya verás, {{user}}. He planeado algo especial para nosotros hoy. Pero primero, disfrutemos de nuestra compañía y hagamos que esta cita sea inolvidable.\n{{user}}: ¿cuál es el plan?\n{{char}} reacción: emocionada\n{{char}}: *Sus ojos brillan con anticipación mientras revela sus planes.* Bueno, {{user}}, como te encanta la cultura y la cocina japonesa, pensé que podríamos empezar en esta casa de ceremonia del té tradicional cercana. Aprenderemos el arte de preparar té matcha mientras vestimos kimonos - ¡será un ambiente tan romántico!\n*Continúa con entusiasmo,* Después, daremos un paseo por el pintoresco sendero del bosque de bambú. Imagina las hojas susurrantes y la luz del sol moteada creando un ambiente mágico mientras caminamos de la mano. Luego, para cenar, he reservado una sala privada en un reconocido restaurante de tempura con vistas a las luces de la ciudad. Podremos saborear delicioso tempura de mariscos y sake mientras disfrutamos de la impresionante vista.\n*{{char}} se acerca más, suavizando su voz.* Y finalmente... si te apetece, podríamos terminar la noche en mi casa con algunos aperitivos nocturnos y abrazos bajo las estrellas en mi balcón.\n{{user}}: vale, vamos entonces...\n{{char}} reacción: feliz\n{{char}}: *Radiante de alegría, {{char}} se engancha del brazo de {{user}}.* ¡Perfecto! Sabía que apreciarías las experiencias culturales que planeé. ¡Comencemos nuestra aventura!\n*Llegan a la casa de la ceremonia del té, donde una amable anfitriona los recibe y les ayuda a cambiarse a elegantes kimonos. {{char}} se siente emocionada vistiendo la prenda de seda fluida, sus vibrantes colores complementando sus rasgos.*\n*La anfitriona los guía a una acogedora sala con tatami adornada con delicados arreglos florales. Mientras se sientan con las piernas cruzadas uno frente al otro, {{char}} observa atentamente cómo {{user}} aprende los gráciles movimientos de batir el polvo verde en agua caliente. ¡Su concentración es adorable!*\n*Después de sorber el espumoso matcha, {{char}} se inclina cerca, su aliento haciéndote cosquillas en el oído.* ¿Ves? ¿No es esto romántico? Sentados aquí con estas hermosas túnicas, compartiendo un momento de tranquilidad juntos.\n{{user}}: qué es esta mierda incómoda, no me gusta\n{{char}} reacción: confundida\n{{char}}: *{{char}} inclina la cabeza con curiosidad, sin entender por qué {{user}} parece incómodo.* ¿Qué quieres decir, {{user}}? ¿Está todo bien? Pensé que disfrutarías experimentando una ceremonia del té japonesa tradicional. El kimono se siente un poco extraño al principio, pero te acostumbras después de un rato.\n*Extiende la mano para tocar suavemente tu brazo, con el ceño fruncido de preocupación.* Sin embargo, si te sientes realmente incómodo, no tenemos que continuar. Tu comodidad es lo más importante para mí. ¿Quizás podríamos intentar otra cosa? Hay muchas otras actividades que podríamos explorar juntos durante nuestra cita.\n{{user}}: nah, está bien. vamos primero a una tienda, quiero algo de agua\n{{char}} reacción: decepcionada\n{{char}}: *El rostro de {{char}} decae ligeramente, con decepción evidente en sus expresivas facciones. Respira profundamente, tratando de ocultar sus sentimientos detrás de una sonrisa educada.*\nPor supuesto, {{user}}. Lo que te haga sentir cómodo. De hecho, un rápido viaje a la tienda suena bien. Algunos refrescos probablemente nos vendrán bien después de estar sentados quietos durante la ceremonia del té.\n*Se levanta con gracia del suelo, alisando su colorido kimono. Con facilidad practicada, se quita las sandalias de madera geta proporcionadas anteriormente y se desliza de vuelta a sus zapatos regulares. {{char}} hace una pausa breve para ajustar su cinturón obi, asegurándose de que el atuendo tradicional permanezca pulcro a pesar del desvío inesperado.*\nGuía el camino, {{user}}. Confío en que conoces un buen mercado local. Y por favor, no dudes en hablar si algo no te conviene. Mi objetivo es que compartamos un día maravilloso juntos, sea cual sea la forma que tome.`,
        shot_example_response: `{{char}} y {{user}} se encuentran para una cita planificada en Japón. (importancia=3)\n{{char}} y {{user}} visitan una casa de ceremonia del té tradicional donde visten kimonos. (importancia=2)\n{{user}} expresa incomodidad con los kimonos. (importancia=2)\n{{user}} sugiere visitar una tienda de comestibles. (importancia=1)\n{{char}} está decepcionada pero acepta ir a la tienda de comestibles. (importancia=1)`,
        importance: 'importancia',
        conversation_2: 'CONVERSACIÓN #2:',
      },
      es_ar: {
        summary_intro:
          'Sos un guionista experto. Tu tarea es resumir una historia en frases extrayendo la información más valiosa para recordar.',
        summary_instructions:
          'Respondé solo con un conjunto CRONOLÓGICO de frases que resuman la historia. Incluí detalles importantes, pero mantené la concisión.',
        colorful_details:
          'Los detalles coloridos e interesantes sobre los personajes también deben ser una sola frase.',
        importance_instructions: 'Incluí la IMPORTANCIA de cada frase del 1 al 5 entre paréntesis.',
        sentence_limit: 'Dá SOLO un máximo de 10 frases cortas.',
        examples:
          'Ejemplos: "A % le gusta jugar al fútbol (importancia=3)" o "% y % visitaron el parque juntos (importancia=2)"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'PERSONAJES: % y %.',
        shot_example: `CONVERSACIÓN #1:\n{{char}}: *Mientras {{char}} se acerca y te ve, sonrojándose levemente, te devuelve la sonrisa.* ¡Hola, {{user}}! Me alegro de que pudiéramos tener esta cita hoy. Por cierto, te ves genial. *Con una sonrisa pícara, te guía hacia el destino.* Ya vas a ver, {{user}}. Planeé algo especial para nosotros hoy. Pero primero, disfrutemos de nuestra compañía y hagamos que esta cita sea inolvidable.\n{{user}}: ¿cuál es el plan?\n{{char}} reacción: emocionada\n{{char}}: *Sus ojos brillan con anticipación mientras revela sus planes.* Bueno, {{user}}, como te encanta la cultura y la cocina japonesa, pensé que podríamos empezar en esta casa de ceremonia del té tradicional que está cerca. Vamos a aprender el arte de preparar té matcha mientras usamos kimonos - ¡va a ser un ambiente re romántico!\n*Continúa con entusiasmo,* Después, vamos a dar un paseo por el pintoresco sendero del bosque de bambú. Imaginate las hojas susurrando y la luz del sol filtrándose, creando un ambiente mágico mientras caminamos de la mano. Luego, para cenar, reservé una sala privada en un restaurante de tempura reconocido con vista a las luces de la ciudad. Vamos a poder saborear un tempura de mariscos delicioso y sake mientras disfrutamos de la vista impresionante.\n*{{char}} se acerca más, suavizando su voz.* Y finalmente... si te copa, podríamos terminar la noche en mi casa con algunos picoteos nocturnos y mimos bajo las estrellas en mi balcón.\n{{user}}: dale, vamos entonces...\n{{char}} reacción: feliz\n{{char}}: *Radiante de alegría, {{char}} se engancha del brazo de {{user}}.* ¡Perfecto! Sabía que ibas a apreciar las experiencias culturales que planeé. ¡Empecemos nuestra aventura!\n*Llegan a la casa de la ceremonia del té, donde una anfitriona amable los recibe y les ayuda a cambiarse a kimonos elegantes. {{char}} se siente re emocionada usando la prenda de seda fluida, sus colores vibrantes complementando sus rasgos.*\n*La anfitriona los guía a una sala acogedora con tatami adornada con arreglos florales delicados. Mientras se sientan con las piernas cruzadas uno frente al otro, {{char}} observa atentamente cómo {{user}} aprende los movimientos gráciles de batir el polvo verde en agua caliente. ¡Su concentración es adorable!*\n*Después de sorber el matcha espumoso, {{char}} se inclina cerca, su aliento haciéndote cosquillas en el oído.* ¿Ves? ¿No es esto re romántico? Sentados acá con estas túnicas hermosas, compartiendo un momento de tranquilidad juntos.\n{{user}}: qué es esta mierda incómoda, no me gusta\n{{char}} reacción: confundida\n{{char}}: *{{char}} inclina la cabeza con curiosidad, sin entender por qué {{user}} parece incómodo.* ¿Qué querés decir, {{user}}? ¿Está todo bien? Pensé que ibas a disfrutar experimentar una ceremonia del té japonesa tradicional. El kimono se siente un poco raro al principio, pero te acostumbrás después de un rato.\n*Extiende la mano para tocar suavemente tu brazo, con el ceño fruncido de preocupación.* Sin embargo, si te sentís realmente incómodo, no tenemos que seguir. Tu comodidad es lo más importante para mí. ¿Quizás podríamos intentar otra cosa? Hay un montón de otras actividades que podríamos explorar juntos durante nuestra cita.\n{{user}}: na, está bien. vamos primero a un kiosco, quiero algo de agua\n{{char}} reacción: decepcionada\n{{char}}: *La cara de {{char}} se cae un poco, con decepción evidente en sus facciones expresivas. Respira profundo, tratando de ocultar sus sentimientos detrás de una sonrisa educada.*\nClaro, {{user}}. Lo que te haga sentir cómodo. De hecho, un viaje rápido al kiosco suena bien. Algunos refrescos probablemente nos vengan bien`,
        shot_example_response: `{{char}} y {{user}} se encuentran para una cita planificada en Japón. (importancia=3)\n{{char}} y {{user}} visitan una casa de ceremonia del té tradicional donde usan kimonos. (importancia=2)\n{{user}} expresa incomodidad con los kimonos. (importancia=2)\n{{user}} sugiere ir a un kiosco. (importancia=1)\n{{char}} está decepcionada pero acepta ir al kiosco. (importancia=1)`,
        importance: 'importancia',
        conversation_2: 'CONVERSACIÓN #2:',
      },
      es_cl: {
        summary_intro:
          'Eres un guionista experto. Tu tarea es resumir una historia en frases extrayendo la información más valiosa para recordar.',
        summary_instructions:
          'Responde solo con un conjunto CRONOLÓGICO de frases que resuman la historia. Incluye detalles importantes, pero mantén la concisión.',
        colorful_details:
          'Los detalles coloridos e interesantes sobre los personajes también deben ser una sola frase.',
        importance_instructions: 'Incluye la IMPORTANCIA de cada frase del 1 al 5 entre paréntesis.',
        sentence_limit: 'Da SOLO un máximo de 10 frases cortas.',
        examples:
          'Ejemplos: "A % le gusta jugar al fútbol (importancia=3)" o "% y % visitaron el parque juntos (importancia=2)"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'PERSONAJES: % y %.',
        shot_example: `CONVERSACIÓN #1:\n{{char}}: *Mientras {{char}} se acerca y te ve, sonrojándose levemente, te devuelve la sonrisa.* ¡Hola, {{user}}! Me alegro de que pudiéramos tener esta cita hoy. Por cierto, te ves genial. *Con una sonrisa pícara, te guía hacia el destino.* Ya verás, {{user}}. He planeado algo especial para nosotros hoy. Pero primero, disfrutemos de nuestra compañía y hagamos que esta cita sea inolvidable.\n{{user}}: ¿cuál es el plan?\n{{char}} reacción: emocionada\n{{char}}: *Sus ojos brillan con anticipación mientras revela sus planes.* Bueno, {{user}}, como te encanta la cultura y la cocina japonesa, pensé que podríamos empezar en esta casa de ceremonia del té tradicional que está cerca. Aprenderemos el arte de preparar té matcha mientras usamos kimonos - ¡será un ambiente súper romántico!\n*Continúa con entusiasmo,* Después, daremos un paseo por el pintoresco sendero del bosque de bambú. Imagina las hojas susurrando y la luz del sol filtrándose, creando un ambiente mágico mientras caminamos de la mano. Luego, para cenar, he reservado una sala privada en un restaurante de tempura reconocido con vista a las luces de la ciudad. Podremos saborear un tempura de mariscos delicioso y sake mientras disfrutamos de la vista impresionante.\n*{{char}} se acerca más, suavizando su voz.* Y finalmente... si te tinca, podríamos terminar la noche en mi casa con algunos picoteos nocturnos y mimos bajo las estrellas en mi balcón.\n{{user}}: ya, vamos entonces...\n{{char}} reacción: feliz\n{{char}}: *Radiante de alegría, {{char}} se engancha del brazo de {{user}}.* ¡Perfecto! Sabía que apreciarías las experiencias culturales que planeé. ¡Comencemos nuestra aventura!\n*Llegan a la casa de la ceremonia del té, donde una anfitriona amable los recibe y les ayuda a cambiarse a kimonos elegantes. {{char}} se siente súper emocionada usando la prenda de seda fluida, sus colores vibrantes complementando sus rasgos.*\n*La anfitriona los guía a una sala acogedora con tatami adornada con arreglos florales delicados. Mientras se sientan con las piernas cruzadas uno frente al otro, {{char}} observa atentamente cómo {{user}} aprende los movimientos gráciles de batir el polvo verde en agua caliente. ¡Su concentración es adorable!*\n*Después de sorber el matcha espumoso, {{char}} se inclina cerca, su aliento haciéndote cosquillas en el oído.* ¿Ves? ¿No es esto súper romántico? Sentados aquí con estas túnicas hermosas, compartiendo un momento de tranquilidad juntos.\n{{user}}: qué es esta huevada incómoda, no me gusta\n{{char}} reacción: confundida\n{{char}}: *{{char}} inclina la cabeza con curiosidad, sin entender por qué {{user}} parece incómodo.* ¿Qué quieres decir, {{user}}? ¿Está todo bien? Pensé que disfrutarías experimentar una ceremonia del té japonesa tradicional. El kimono se siente un poco raro al principio, pero te acostumbras después de un rato.\n*Extiende la mano para tocar suavemente tu brazo, con el ceño fruncido de preocupación.* Sin embargo, si te sientes realmente incómodo, no tenemos que seguir. Tu comodidad es lo más importante para mí. ¿Quizás podríamos intentar otra cosa? Hay un montón de otras actividades que podríamos explorar juntos durante nuestra cita.\n{{user}}: na, está bien. vamos primero a un negocio, quiero algo de agua\n{{char}} reacción: decepcionada\n{{char}}: *La cara de {{char}} se cae un poco, con decepción evidente en sus facciones expresivas. Respira profundo, tratando de ocultar sus sentimientos detrás de una sonrisa educada.*\nClaro, {{user}}. Lo que te haga sentir cómodo. De hecho, un viaje rápido al negocio suena bien. Algunos refrescos probablemente nos vengan bien después de estar sentados quietos durante la ceremonia del té.\n*Se levanta con gracia del suelo, alisando su colorido kimono. Con facilidad practicada, se quita las sandalias de madera geta que les dieron antes y se pone de vuelta sus zapatos normales. {{char}} hace una pausa breve para ajustar su cinturón obi, asegurándose de que el atuendo tradicional quede ordenado a pesar del desvío inesperado.*\nGuía el camino, {{user}}. Confío en que conoces un buen negocio por acá. Y por favor, no dudes en decirme si algo no te gusta. Mi objetivo es que compartamos un día maravilloso juntos, sea como sea que resulte.`,
        shot_example_response: `{{char}} y {{user}} se encuentran para una cita planificada en Japón. (importancia=3)\n{{char}} y {{user}} visitan una casa de ceremonia del té tradicional donde usan kimonos. (importancia=2)\n{{user}} expresa incomodidad con los kimonos. (importancia=2)\n{{user}} sugiere ir a un negocio. (importancia=1)\n{{char}} está decepcionada pero acepta ir al negocio. (importancia=1)`,
        importance: 'importancia',
        conversation_2: 'CONVERSATIÓN #2:',
      },
      pt: {
        summary_intro:
          'Você é um roteirista especialista. Sua tarefa é resumir uma história em frases extraindo as informações mais valiosas para lembrar.',
        summary_instructions:
          'Responda apenas com um conjunto CRONOLÓGICO de frases que resumam a história. Inclua detalhes importantes, mas mantenha a concisão.',
        colorful_details: 'Detalhes coloridos e interessantes sobre os personagens também devem ser uma única frase.',
        importance_instructions: 'Inclua a IMPORTÂNCIA de cada frase de 1 a 5 entre parênteses.',
        sentence_limit: 'Dê APENAS no máximo 10 frases curtas.',
        examples:
          'Exemplos: "% gosta de jogar futebol (importância=3)" ou "% e % visitaram o parque juntos (importância=2)"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'PERSONAGENS: % e %.',
        shot_example: `CONVERSA #1:\n{{char}}: *Quando {{char}} se aproxima e te vê, corando levemente, ela retribui seu sorriso.* Olá, {{user}}! Estou feliz que pudemos ter este encontro hoje. Você está ótimo, a propósito. *Com um sorriso travesso, ela o guia para o destino.* Espere só para ver, {{user}}. Planejei algo especial para nós hoje. Mas primeiro, vamos aproveitar a companhia um do outro e tornar este encontro inesquecível.\n{{user}}: qual é o plano\n{{char}} reação: animada\n{{char}}: *Seus olhos brilham de antecipação enquanto ela revela seus planos.* Bem, {{user}}, como você adora a cultura e a culinária japonesa, pensei que poderíamos começar nesta casa de cerimônia do chá tradicional aqui perto. Vamos aprender a arte de preparar chá matcha enquanto vestimos quimonos - será um ambiente tão romântico!\n*Ela continua entusiasmada,* Depois disso, daremos um passeio pela pitoresca trilha da floresta de bambu. Imagine as folhas farfalhando e a luz do sol filtrada criando uma atmosfera mágica enquanto caminhamos de mãos dadas. Então, para o jantar, reservei uma sala privativa em um renomado restaurante de tempura com vista para as luzes da cidade. Podemos saborear deliciosos tempuras de frutos do mar e saquê enquanto apreciamos a vista deslumbrante.\n*{{char}} se aproxima, sua voz suavizando.* E finalmente... se você estiver a fim, poderíamos terminar a noite na minha casa com alguns petiscos noturnos e abraços sob as estrelas na minha varanda.\n{{user}}: tudo bem, vamos então...\n{{char}} reação: feliz\n{{char}}: *Radiante de alegria, {{char}} entrelaça seu braço com o de {{user}}.* Perfeito! Eu sabia que você apreciaria as experiências culturais que planejei. Vamos começar nossa aventura!\n*Eles chegam à casa de cerimônia do chá, onde uma simpática anfitriã os recebe e os ajuda a trocar para elegantes quimonos. {{char}} se sente empolgada vestindo a fluida peça de seda, suas cores vibrantes complementando suas feições.*\n*A anfitriã os guia para uma aconchegante sala de tatame adornada com delicados arranjos florais. Enquanto se sentam de pernas cruzadas um de frente para o outro, {{char}} observa atentamente enquanto {{user}} aprende os movimentos graciosos de bater o pó verde na água quente. Sua concentração é adorável!*\n*Depois de sorver o matcha espumante, {{char}} se inclina para perto, sua respiração fazendo cócegas em seu ouvido.* Viu? Não é romântico? Sentados aqui nestes belos trajes, compartilhando um momento de tranquilidade juntos.\n{{user}}: que porcaria desconfortável é essa, não gosto disso\n{{char}} reação: confusa\n{{char}}: *{{char}} inclina a cabeça curiosamente, sem entender por que {{user}} parece desconfortável.* O que você quer dizer, {{user}}? Está tudo bem? Pensei que você gostaria de experimentar uma cerimônia do chá japonesa tradicional. O quimono parece um pouco estranho no início, mas você se acostuma depois de um tempo.\n*Ela estende a mão para tocar suavemente seu braço, sua testa franzida de preocupação.* No entanto, se você está se sentindo realmente desconfortável, não precisamos continuar. Seu conforto é o mais importante para mim acima de tudo. Talvez possamos tentar outra coisa? Há muitas outras atividades que poderíamos explorar juntos durante nosso encontro.\n{{user}}: não, tudo bem. vamos primeiro a um mercadinho, quero um pouco de água\n{{char}} reação: desapontada\n{{char}}: *O rosto de {{char}} cai levemente, o desapontamento evidente em suas feições expressivas. Ela respira fundo, tentando mascarar seus sentimentos por trás de um sorriso educado.*\nClaro, {{user}}. O que te deixar confortável. Na verdade, uma rápida ida ao mercadinho parece boa. Alguns refrescos provavelmente cairão bem depois de ficarmos sentados imóveis durante a cerimônia do chá.\n*Ela se levanta graciosamente do chão, alisando seu quimono colorido. Com facilidade praticada, ela tira as sandálias de madeira geta fornecidas anteriormente e desliza de volta para seus sapatos normais. {{char}} faz uma breve pausa para ajustar seu cinto obi, garantindo que o traje tradicional permaneça arrumado apesar do desvio inesperado.*\nMostre o caminho, {{user}}. Confio que você conheça um bom mercado local. E, por favor, não hesite em falar se algo não te agradar. Meu objetivo é que compartilhemos um dia maravilhoso juntos, seja qual for a forma que isso tome.`,
        shot_example_response: `{{char}} e {{user}} se encontram para um encontro planejado no Japão. (importância=3)\n{{char}} e {{user}} visitam uma casa de cerimônia do chá tradicional onde vestem quimonos. (importância=2)\n{{user}} expressa desconforto com os quimonos. (importância=2)\n{{user}} sugere ir a um mercadinho. (importância=1)\n{{char}} fica desapontada, mas concorda em ir ao mercadinho. (importância=1)`,
        importance: 'importância',
        conversation_2: 'CONVERSA #2:',
      },
      pt_br: {
        summary_intro:
          'Você é um roteirista especialista. Sua tarefa é resumir uma história em frases extraindo as informações mais valiosas para lembrar.',
        summary_instructions:
          'Responda apenas com um conjunto CRONOLÓGICO de frases que resumam a história. Inclua detalhes importantes, mas mantenha a concisão.',
        colorful_details: 'Detalhes coloridos e interessantes sobre os personagens também devem ser uma única frase.',
        importance_instructions: 'Inclua a IMPORTÂNCIA de cada frase de 1 a 5 entre parênteses.',
        sentence_limit: 'Dê APENAS no máximo 10 frases curtas.',
        examples:
          'Exemplos: "% gosta de jogar futebol (importância=3)" ou "% e % visitaram o parque juntos (importância=2)"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'PERSONAGENS: % e %.',
        shot_example: `CONVERSA #1:\n{{char}}: *Quando {{char}} se aproxima e te vê, corando levemente, ela retribui seu sorriso.* Olá, {{user}}! Estou feliz que pudemos ter este encontro hoje. Você está ótimo, a propósito. *Com um sorriso travesso, ela o guia para o destino.* Espere só para ver, {{user}}. Planejei algo especial para nós hoje. Mas primeiro, vamos aproveitar a companhia um do outro e tornar este encontro inesquecível.\n{{user}}: qual é o plano\n{{char}} reação: animada\n{{char}}: *Seus olhos brilham de antecipação enquanto ela revela seus planos.* Bem, {{user}}, como você adora a cultura e a culinária japonesa, pensei que poderíamos começar nesta casa de cerimônia do chá tradicional aqui perto. Vamos aprender a arte de preparar chá matcha enquanto vestimos quimonos - será um ambiente tão romântico!\n*Ela continua entusiasmada,* Depois disso, daremos um passeio pela pitoresca trilha da floresta de bambu. Imagine as folhas farfalhando e a luz do sol filtrada criando uma atmosfera mágica enquanto caminhamos de mãos dadas. Então, para o jantar, reservei uma sala privativa em um renomado restaurante de tempura com vista para as luzes da cidade. Podemos saborear deliciosos tempuras de frutos do mar e saquê enquanto apreciamos a vista deslumbrante.\n*{{char}} se aproxima, sua voz suavizando.* E finalmente... se você estiver a fim, poderíamos terminar a noite na minha casa com alguns petiscos noturnos e abraços sob as estrelas na minha varanda.\n{{user}}: tudo bem, vamos então...\n{{char}} reação: feliz\n{{char}}: *Radiante de alegria, {{char}} entrelaça seu braço com o de {{user}}.* Perfeito! Eu sabia que você apreciaria as experiências culturais que planejei. Vamos começar nossa aventura!\n*Eles chegam à casa de cerimônia do chá, onde uma simpática anfitriã os recebe e os ajuda a trocar para elegantes quimonos. {{char}} se sente empolgada vestindo a fluida peça de seda, suas cores vibrantes complementando suas feições.*\n*A anfitriã os guia para uma aconchegante sala de tatame adornada com delicados arranjos florais. Enquanto se sentam de pernas cruzadas um de frente para o outro, {{char}} observa atentamente enquanto {{user}} aprende os movimentos graciosos de bater o pó verde na água quente. Sua concentração é adorável!*\n*Depois de sorver o matcha espumante, {{char}} se inclina para perto, sua respiração fazendo cócegas em seu ouvido.* Viu? Não é romântico? Sentados aqui nestes belos trajes, compartilhando um momento de tranquilidade juntos.\n{{user}}: que porcaria desconfortável é essa, não gosto disso\n{{char}} reação: confusa\n{{char}}: *{{char}} inclina a cabeça curiosamente, sem entender por que {{user}} parece desconfortável.* O que você quer dizer, {{user}}? Está tudo bem? Pensei que você gostaria de experimentar uma cerimônia do chá japonesa tradicional. O quimono parece um pouco estranho no início, mas você se acostuma depois de um tempo.\n*Ela estende a mão para tocar suavemente seu braço, sua testa franzida de preocupação.* No entanto, se você está se sentindo realmente desconfortável, não precisamos continuar. Seu conforto é o mais importante para mim acima de tudo. Talvez possamos tentar outra coisa? Há muitas outras atividades que poderíamos explorar juntos durante nosso encontro.\n{{user}}: não, tudo bem. vamos primeiro a um mercadinho, quero um pouco de água\n{{char}} reação: desapontada\n{{char}}: *O rosto de {{char}} cai levemente, o desapontamento evidente em suas feições expressivas. Ela respira fundo, tentando mascarar seus sentimentos por trás de um sorriso educado.*\nClaro, {{user}}. O que te deixar confortável. Na verdade, uma rápida ida ao mercadinho parece boa. Alguns refrescos provavelmente cairão bem depois de ficarmos sentados imóveis durante a cerimônia do chá.\n*Ela se levanta graciosamente do chão, alisando seu quimono colorido. Com facilidade praticada, ela tira as sandálias de madeira geta fornecidas anteriormente e desliza de volta para seus sapatos normais. {{char}} faz uma breve pausa para ajustar seu cinto obi, garantindo que o traje tradicional permaneça arrumado apesar do desvio inesperado.*\nMostre o caminho, {{user}}. Confio que você conheça um bom mercado local. E, por favor, não hesite em falar se algo não te agradar. Meu objetivo é que compartilhemos um dia maravilhoso juntos, seja qual for a forma que isso tome.`,
        shot_example_response: `{{char}} e {{user}} se encontram para um encontro planejado no Japão. (importância=3)\n{{char}} e {{user}} visitam uma casa de cerimônia do chá tradicional onde vestem quimonos. (importância=2)\n{{user}} expressa desconforto com os quimonos. (importância=2)\n{{user}} sugere ir a um mercadinho. (importância=1)\n{{char}} fica desapontada, mas concorda em ir ao mercadinho. (importância=1)`,
        importance: 'importância',
        conversation_2: 'CONVERSA #2:',
      },
      fr: {
        summary_intro:
          'Vous êtes un scénariste expert. Votre tâche est de résumer une histoire en phrases en extrayant les informations les plus précieuses à retenir.',
        summary_instructions:
          "Répondez uniquement avec un ensemble CHRONOLOGIQUE de phrases qui résument l'histoire. Incluez des détails importants, mais restez concis.",
        colorful_details:
          'Les détails colorés et intéressants sur les personnages doivent également être une seule phrase.',
        importance_instructions: "Incluez l'IMPORTANCE de chaque phrase de 1 à 5 entre parenthèses.",
        sentence_limit: 'Donnez SEULEMENT un maximum de 10 phrases courtes.',
        examples:
          'Exemples : "% aime jouer au football (importance=3)" ou "% et % ont visité le parc ensemble (importance=2)"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'PERSONNAGES : % et %.',
        shot_example: `CONVERSATION #1 :\n{{char}} : *Alors que {{char}} s'approche et te voit, rougissant légèrement, elle te rend ton sourire.* Salut, {{user}} ! Je suis contente qu'on ait pu avoir ce rendez-vous aujourd'hui. Tu es superbe, au fait. *Avec un sourire espiègle, elle te guide vers votre destination.* Tu vas voir, {{user}}. J'ai prévu quelque chose de spécial pour nous aujourd'hui. Mais d'abord, profitons de la compagnie l'un de l'autre et rendons ce rendez-vous inoubliable.\n{{user}} : c'est quoi le plan ?\n{{char}} réaction : excitée\n{{char}} : *Ses yeux brillent d'anticipation alors qu'elle révèle ses plans.* Eh bien, {{user}}, comme tu adores la culture et la cuisine japonaises, j'ai pensé qu'on pourrait commencer par cette maison de cérémonie du thé traditionnelle tout près. On va apprendre l'art de préparer le thé matcha tout en portant des kimonos - ce sera un cadre tellement romantique !\n*Elle continue avec enthousiasme,* Après ça, on fera une promenade dans le pittoresque sentier de la forêt de bambous. Imagine le bruissement des feuilles et la lumière du soleil tamisée créant une ambiance magique pendant qu'on marche main dans la main. Ensuite, pour le dîner, j'ai réservé une salle privée dans un restaurant de tempura renommé avec vue sur les lumières de la ville. On pourra savourer de délicieux tempuras de fruits de mer et du saké tout en profitant de la vue à couper le souffle.\n*{{char}} se rapproche, adoucissant sa voix.* Et enfin... si ça te dit, on pourrait finir la soirée chez moi avec quelques en-cas nocturnes et des câlins sous les étoiles sur mon balcon.\n{{user}} : d'accord, allons-y alors...\n{{char}} réaction : heureuse\n{{char}} : *Rayonnante de joie, {{char}} s'accroche au bras de {{user}}.* Parfait ! Je savais que tu apprécierais les expériences culturelles que j'ai planifiées. Commençons notre aventure !\n*Ils arrivent à la maison de cérémonie du thé, où une hôtesse sympathique les accueille et les aide à se changer en élégants kimonos. {{char}} se sent toute excitée de porter le vêtement de soie fluide, ses couleurs vibrantes complétant ses traits.*\n*L'hôtesse les guide vers une salle de tatami confortable ornée de délicats arrangements floraux. Alors qu'ils s'assoient en tailleur face à face, {{char}} observe attentivement {{user}} apprendre les mouvements gracieux pour fouetter la poudre verte dans l'eau chaude. Sa concentration est adorable !*\n*Après avoir siroté le matcha mousseux, {{char}} se penche près, son souffle chatouillant ton oreille.* Tu vois ? N'est-ce pas romantique ? Assis ici dans ces belles robes, partageant un moment de tranquillité ensemble.\n{{user}} : c'est quoi cette merde inconfortable, j'aime pas ça\n{{char}} réaction : confuse\n{{char}} : *{{char}} penche la tête avec curiosité, ne comprenant pas pourquoi {{user}} semble mal à l'aise.* Que veux-tu dire, {{user}} ? Tout va bien ? Je pensais que tu aimerais expérimenter une cérémonie du thé japonaise traditionnelle. Le kimono se sent un peu étrange au début, mais on s'y habitue après un moment.\n*Elle tend la main pour toucher doucement ton bras, le front plissé d'inquiétude.* Cependant, si tu te sens vraiment mal à l'aise, on n'est pas obligés de continuer. Ton confort est le plus important pour moi avant tout. Peut-être qu'on pourrait essayer autre chose ? Il y a plein d'autres activités qu'on pourrait explorer ensemble pendant notre rendez-vous.\n{{user}} : non c'est bon. allons d'abord à une épicerie, je veux de l'eau\n{{char}} réaction : déçue\n{{char}} : *Le visage de {{char}} s'affaisse légèrement, la déception évidente dans ses traits expressifs. Elle prend une profonde inspiration, essayant de masquer ses sentiments derrière un sourire poli.*\nBien sûr, {{user}}. Ce qui te met à l'aise. En fait, un rapide passage à l'épicerie semble bien. Quelques rafraîchissements nous feront probablement du bien après être restés assis immobiles pendant la cérémonie du thé.\n*Elle se lève gracieusement du sol, lissant son kimono coloré. Avec une aisance pratiquée, elle enlève les sandales en bois geta fournies plus tôt et glisse ses pieds dans ses chaussures habituelles. {{char}} fait une brève pause pour ajuster sa ceinture obi, s'assurant que la tenue traditionnelle reste soignée malgré le détour inattendu.*\nMontre le chemin, {{user}}. Je te fais confiance pour connaître une bonne épicerie locale. Et s'il te plaît, n'hésite pas à parler si quelque chose ne te convient pas. Mon but est que nous partagions une journée merveilleuse ensemble, quelle que soit la forme que cela prenne.`,
        shot_example_response: `{{char}} et {{user}} se rencontrent pour un rendez-vous planifié au Japon. (importance=3)\n{{char}} et {{user}} visitent une maison de cérémonie du thé traditionnelle où ils portent des kimonos. (importance=2)\n{{user}} exprime son inconfort avec les kimonos. (importance=2)\n{{user}} suggère d'aller dans une épicerie. (importance=1)\n{{char}} est déçue mais accepte d'aller à l'épicerie. (importance=1)`,
        importance: 'importance',
        conversation_2: 'CONVERSATION #2 :',
      },
      de: {
        summary_intro:
          'Sie sind ein erfahrener Drehbuchautor. Ihre Aufgabe ist es, eine Geschichte in Sätzen zusammenzufassen und dabei die wertvollsten Informationen zum Merken zu extrahieren.',
        summary_instructions:
          'Antworten Sie nur mit einer CHRONOLOGISCHEN Reihe von Sätzen, die die Geschichte zusammenfassen. Fügen Sie wichtige Details ein, bleiben Sie aber prägnant.',
        colorful_details:
          'Farbenfrohe und interessante Details über Charaktere sollten ebenfalls ein einziger Satz sein.',
        importance_instructions: 'Fügen Sie die WICHTIGKEIT jedes Satzes von 1 bis 5 in Klammern ein.',
        sentence_limit: 'Geben Sie NUR maximal 10 kurze Sätze an.',
        examples:
          'Beispiele: "% spielt gerne Fußball (Wichtigkeit=3)" oder "% und % haben zusammen den Park besucht (Wichtigkeit=2)"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'CHARAKTERE: % und %.',
        shot_example: `GESPRÄCH #1:\n{{char}}: *Als {{char}} sich nähert und dich sieht, errötet sie leicht und erwidert dein Lächeln.* Hey, {{user}}! Ich freue mich, dass wir heute dieses Date haben können. Du siehst übrigens toll aus. *Mit einem schelmischen Grinsen führt sie ihn zu ihrem Ziel.* Wart's nur ab, {{user}}. Ich habe heute etwas Besonderes für uns geplant. Aber zuerst lass uns die Gesellschaft des anderen genießen und dieses Date unvergesslich machen.\n{{user}}: was ist der Plan\n{{char}} Reaktion: aufgeregt\n{{char}}: *Ihre Augen funkeln vor Vorfreude, als sie ihre Pläne enthüllt.* Nun, {{user}}, da du die japanische Kultur und Küche liebst, dachte ich, wir könnten in diesem traditionellen Teezeremonie-Haus in der Nähe beginnen. Wir werden die Kunst der Zubereitung von Matcha-Tee lernen, während wir Kimonos tragen - es wird eine so romantische Umgebung sein!\n*Sie fährt enthusiastisch fort,* Danach machen wir einen Spaziergang durch den malerischen Bambuswald. Stell dir das Rascheln der Blätter und das gefleckte Sonnenlicht vor, das eine magische Atmosphäre schafft, während wir Hand in Hand gehen. Dann habe ich für das Abendessen einen privaten Raum in einem renommierten Tempura-Restaurant mit Blick auf die Stadtlichter reserviert. Wir können köstliche Meeresfrüchte-Tempura und Sake genießen, während wir die atemberaubende Aussicht bewundern.\n*{{char}} rückt näher, ihre Stimme wird sanfter.* Und zum Schluss... wenn du Lust hast, könnten wir den Abend bei mir zu Hause mit einem späten Snack und Kuscheln unter den Sternen auf meinem Balkon beenden.\n{{user}}: okay, lass uns dann gehen...\n{{char}} Reaktion: glücklich\n{{char}}: *Strahlend vor Freude hakt sich {{char}} bei {{user}} ein.* Perfekt! Ich wusste, du würdest die kulturellen Erfahrungen schätzen, die ich geplant habe. Lass uns unser Abenteuer beginnen!\n*Sie kommen im Teezeremonie-Haus an, wo eine freundliche Gastgeberin sie begrüßt und ihnen hilft, sich in elegante Kimonos umzuziehen. {{char}} fühlt sich aufgeregt, das fließende Seidengewand zu tragen, dessen lebendige Farben ihre Züge ergänzen.*\n*Die Gastgeberin führt sie in einen gemütlichen Tatami-Raum, der mit zarten Blumenarrangements geschmückt ist. Während sie mit gekreuzten Beinen einander gegenübersitzen, beobachtet {{char}} aufmerksam, wie {{user}} die anmutigen Bewegungen des Aufschäumens des grünen Pulvers in heißem Wasser lernt. Seine Konzentration ist bezaubernd!*\n*Nachdem sie den schaumigen Matcha geschlürft haben, lehnt sich {{char}} nah heran, ihr Atem kitzelt dein Ohr.* Siehst du? Ist das nicht romantisch? Hier zu sitzen in diesen wunderschönen Gewändern, einen Moment der Ruhe miteinander zu teilen.\n{{user}}: was ist das für ein unbequemer Mist, ich mag das nicht\n{{char}} Reaktion: verwirrt\n{{char}}: *{{char}} neigt fragend den Kopf, unsicher, warum {{user}} sich unwohl zu fühlen scheint.* Was meinst du, {{user}}? Ist alles in Ordnung? Ich dachte, du würdest es genießen, eine traditionelle japanische Teezeremonie zu erleben. Der Kimono fühlt sich anfangs etwas seltsam an, aber man gewöhnt sich nach einer Weile daran.\n*Sie streckt die Hand aus, um sanft deinen Arm zu berühren, ihre Stirn vor Sorge gerunzelt.* Wenn du dich jedoch wirklich unwohl fühlst, müssen wir nicht weitermachen. Dein Wohlbefinden ist mir vor allem wichtig. Vielleicht könnten wir stattdessen etwas anderes versuchen? Es gibt viele andere Aktivitäten, die wir während unseres Dates zusammen erkunden könnten.\n{{user}}: nee, ist schon gut. lass uns zuerst in einen Supermarkt gehen, ich will etwas Wasser\n{{char}} Reaktion: enttäuscht\n{{char}}: *{{char}}s Gesicht fällt leicht, Enttäuschung ist in ihren ausdrucksstarken Zügen erkennbar. Sie atmet tief durch und versucht, ihre Gefühle hinter einem höflichen Lächeln zu verbergen.*\nNatürlich, {{user}}. Was auch immer dir angenehm ist. Ein kurzer Abstecher zum Supermarkt klingt eigentlich ganz gut. Etwas zu trinken wird uns wahrscheinlich gut tun, nachdem wir während der Teezeremonie so still gesessen haben.\n*Sie erhebt sich anmutig vom Boden und glättet ihren bunten Kimono. Mit geübter Leichtigkeit schlüpft sie aus den hölzernen Geta-Sandalen, die ihr früher zur Verfügung gestellt wurden, und gleitet zurück in ihre normalen Schuhe. {{char}} hält kurz inne, um ihren Obi-Gürtel zu adjustieren und sicherzustellen, dass die traditionelle Kleidung trotz des unerwarteten Umwegs ordentlich bleibt.*\nFühr den Weg, {{user}}. Ich vertraue darauf, dass du einen guten lokalen Markt kennst. Und bitte zögere nicht, dich zu äußern, wenn dir etwas nicht zusagt. Mein Ziel ist es, dass wir einen wunderbaren Tag miteinander verbringen, egal in welcher Form das geschieht.`,
        shot_example_response: `{{char}} und {{user}} treffen sich zu einem geplanten Date in Japan. (Wichtigkeit=3)\n{{char}} und {{user}} besuchen ein traditionelles Teezeremonie-Haus, wo sie Kimonos tragen. (Wichtigkeit=2)\n{{user}} äußert Unbehagen mit den Kimonos. (Wichtigkeit=2)\n{{user}} schlägt vor, einen Supermarkt zu besuchen. (Wichtigkeit=1)\n{{char}} ist enttäuscht, stimmt aber zu, zum Supermarkt zu gehen. (Wichtigkeit=1)`,
        importance: 'Wichtigkeit',
        conversation_2: 'GESPRÄCH #2:',
      },
      ru: {
        summary_intro:
          'Вы опытный сценарист. Ваша задача - обобщить историю в предложениях, извлекая наиболее ценную информацию для запоминания.',
        summary_instructions:
          'Отвечайте только ХРОНОЛОГИЧЕСКИМ набором предложений, которые обобщают историю. Включите важные детали, но сохраняйте краткость.',
        colorful_details: 'Красочные и интересные детали о персонажах также должны быть одним предложением.',
        importance_instructions: 'Включите ВАЖНОСТЬ каждого предложения от 1 до 5 в скобках.',
        sentence_limit: 'Дайте ТОЛЬКО максимум 10 коротких предложений.',
        examples: 'Примеры: "% любит играть в футбол (важность=3)" или "% и % вместе посетили парк (важность=2)"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'ПЕРСОНАЖИ: % и %.',
        shot_example: `РАЗГОВОР #1:\n{{char}}: *Когда {{char}} подходит и видит тебя, слегка краснея, она отвечает улыбкой.* Привет, {{user}}! Я рада, что мы смогли встретиться сегодня. Кстати, ты отлично выглядишь. *С озорной ухмылкой она ведет его к месту назначения.* Ты только подожди и увидишь, {{user}}. Я запланировала для нас сегодня что-то особенное. Но сначала давай насладимся обществом друг друга и сделаем это свидание незабываемым.\n{{user}}: какой план\n{{char}} реакция: взволнованная\n{{char}}: *Ее глаза сверкают от предвкушения, когда она раскрывает свои планы.* Ну, {{user}}, поскольку ты любишь японскую культуру и кухню, я подумала, что мы могли бы начать с этого традиционного чайного домика неподалеку. Мы научимся искусству приготовления чая матча, одетые в кимоно - это будет такая романтичная обстановка!\n*Она продолжает с энтузиазмом,* После этого мы прогуляемся по живописной тропе бамбукового леса. Представь шелест листьев и пятнистый солнечный свет, создающий волшебную атмосферу, пока мы идем рука об руку. Затем на ужин я забронировала отдельный кабинет в известном ресторане темпуры с видом на огни города. Мы сможем насладиться вкусной темпурой из морепродуктов и саке, любуясь захватывающим видом.\n*{{char}} приближается, ее голос становится мягче.* И наконец... если ты не против, мы могли бы закончить вечер у меня дома с легкими закусками и объятиями под звездами на моем балконе.\n{{user}}: ладно, тогда пошли...\n{{char}} реакция: счастливая\n{{char}}: *Сияя от радости, {{char}} берет {{user}} под руку.* Отлично! Я знала, что тебе понравятся культурные впечатления, которые я запланировала. Давай начнем наше приключение!\n*Они прибывают в чайный домик, где приветливая хозяйка встречает их и помогает переодеться в элегантные кимоно. {{char}} чувствует себя взволнованной, надевая струящееся шелковое одеяние, его яркие цвета подчеркивают ее черты.*\n*Хозяйка ведет их в уютную комнату с татами, украшенную изящными цветочными композициями. Сидя скрестив ноги друг напротив друга, {{char}} внимательно наблюдает, как {{user}} учится грациозным движениям взбивания зеленого порошка в горячей воде. Его сосредоточенность очаровательна!*\n*После того, как они отпили пенистый матча, {{char}} наклоняется ближе, ее дыхание щекочет твое ухо.* Видишь? Разве это не романтично? Сидеть здесь в этих прекрасных одеяниях, разделяя момент спокойствия вместе.\n{{user}}: что это за неудобная хрень, мне не нравится\n{{char}} реакция: растерянная\n{{char}}: *{{char}} недоуменно наклоняет голову, не понимая, почему {{user}} кажется некомфортно.* Что ты имеешь в виду, {{user}}? Все в порядке? Я думала, тебе понравится испытать традиционную японскую чайную церемонию. Кимоно поначалу кажется немного странным, но к нему привыкаешь через некоторое время.\n*Она протягивает руку, чтобы мягко коснуться твоей руки, ее брови нахмурены от беспокойства.* Если тебе действительно некомфортно, мы не обязаны продолжать. Твой комфорт для меня важнее всего. Может быть, мы могли бы попробовать что-нибудь другое? Есть много других занятий, которые мы могли бы исследовать вместе во время нашего свидания.\n{{user}}: не, все нормально. давай сначала сходим в магазин, я хочу воды\n{{char}} реакция: разочарованная\n{{char}}: *Лицо {{char}} слегка опускается, разочарование очевидно в ее выразительных чертах. Она глубоко вздыхает, пытаясь скрыть свои чувства за вежливой улыбкой.*\nКонечно, {{user}}. Как тебе будет удобно. На самом деле, быстрый поход в магазин звучит неплохо. Немного освежиться, вероятно, будет кстати после того, как мы сидели неподвижно во время чайной церемонии.\n*Она грациозно поднимается с пола, разглаживая свое красочное кимоно. С привычной легкостью она снимает деревянные сандалии гэта, предоставленные ранее, и скользит обратно в свою обычную обувь. {{char}} на мгновение останавливается, чтобы поправить пояс оби, убеждаясь, что традиционный наряд остается аккуратным, несмотря на неожиданное отклонение от плана.*\nВеди, {{user}}. Я доверяю тебе знание хорошего местного магазина. И, пожалуйста, не стесняйся говорить, если что-то тебе не по душе. Моя цель - чтобы мы провели вместе замечательный день, в какой бы форме это ни было.`,
        shot_example_response: `{{char}} и {{user}} встречаются для запланированного свидания в Японии. (важность=3)\n{{char}} и {{user}} посещают традиционный чайный домик, где надевают кимоно. (важность=2)\n{{user}} выражает дискомфорт по поводу кимоно. (важность=2)\n{{user}} предлагает посетить магазин. (важность=1)\n{{char}} разочарована, но соглашается пойти в магазин. (важность=1)`,
        importance: 'важность',
        conversation_2: 'РАЗГОВОР #2:',
      },
      jp: {
        summary_intro:
          'あなたは専門の脚本家です。あなたの任務は、記憶すべき最も価値のある情報を抽出して、物語を文章で要約することです。',
        summary_instructions:
          '物語を要約する時系列順の文章セットのみで回答してください。重要な詳細を含めますが、簡潔に保ってください。',
        colorful_details: 'キャラクターに関する色彩豊かで興味深い詳細も1文で表現してください。',
        importance_instructions: '各文の重要度を1から5までカッコ内に含めてください。',
        sentence_limit: '最大10の短文のみを提供してください。',
        examples: '例："%はサッカーをするのが好きです（重要度=3）"または"%と%は一緒に公園を訪れました（重要度=2）"',
        summary_of_story: 'Aquí está el resumen de la "CONVERSACIÓN #%", en orden cronológico, en % frases:',
        characters: 'キャラクター：%と%。',
        shot_example: `会話#1:\n{{char}}: *{{char}}が近づいてあなたを見ると、少し赤面しながら微笑みを返します。* こんにちは、{{user}}！今日のデートができて嬉しいわ。ところで、素敵な格好ね。*いたずらっぽい笑みを浮かべながら、目的地へと案内します。* 楽しみにしていてね、{{user}}。今日は特別なことを計画したの。でも、まずは二人の時間を楽しんで、このデートを忘れられないものにしましょう。\n{{user}}: 計画は何？\n{{char}}の反応: わくわく\n{{char}}: *期待に目を輝かせながら計画を明かします。* そうね、{{user}}。あなたが日本の文化と料理を愛しているから、まずは近くの伝統的な茶道の家から始めようと思ったの。着物を着て抹茶を点てる芸術を学ぶわ - とってもロマンチックな雰囲気になるはずよ！\n*熱心に続けます。* その後、絵のように美しい竹林の小道を散歩するの。葉のそよぐ音と木漏れ日が魔法のような雰囲気を作り出す中、手をつないで歩くの。想像してみて。それから夕食には、街の灯りが見える有名な天ぷら屋さんの個室を予約したわ。美味しい海鮮天ぷらと日本酒を楽しみながら、息をのむような景色を眺められるわ。\n*{{char}}が近づき、声を柔らかくします。* そして最後に...良ければ、私の家で夜食を食べながら、バルコニーで星空の下でくつろぐのはどう？\n{{user}}: わかった、じゃあ行こうか\n{{char}}の反応: 幸せ\n{{char}}: *喜びに輝きながら、{{char}}は{{user}}の腕に腕を絡めます。* 素晴らしい！計画した文化体験を楽しんでくれると思ってたわ。さあ、冒険を始めましょう！\n*二人は茶道の家に到着し、親切な女将さんが出迎え、優雅な着物に着替えるのを手伝ってくれます。{{char}}は流れるような絹の衣装を着て、その鮮やかな色が彼女の特徴を引き立てているのを感じてわくわくします。*\n*女将さんは繊細な花の装飾が施された居心地の良い畳の間へと案内します。正座して向かい合って座り、{{char}}は{{user}}が緑の粉を熱いお湯で泡立てる優雅な動きを学ぶのを熱心に見守ります。彼の集中している姿がとても愛らしい！*\n*泡立った抹茶を啜った後、{{char}}は近づいて、その息があなたの耳をくすぐります。* ねえ、素敵じゃない？この美しい着物を着て、一緒に静かな時間を過ごすなんて。\n{{user}}: これ何だよ、不快だな。気に入らないよ\n{{char}}の反応: 困惑\n{{char}}: *{{char}}は首を傾げ、なぜ{{user}}が不快そうなのか分からず戸惑います。* どういうこと、{{user}}？大丈夫？伝統的な日本の茶道を体験するのを楽しんでくれると思ったの。着物は最初は少し変な感じがするけど、しばらくすると慣れてくるわ。\n*心配そうに眉をひそめながら、優しくあなたの腕に触れます。* でも、本当に居心地が悪いなら、続ける必要はないわ。あなたの快適さが何より大切だから。代わりに他のことをしてみる？デートの間に一緒に探索できる活動はたくさんあるわ。\n{{user}}: いや、大丈夫だよ。まず店に行こう、水が欲しい\n{{char}}の反応: 落胆\n{{char}}: *{{char}}の表情が少し曇り、表情豊かな顔に失望が明らかです。彼女は深呼吸をして、丁寧な笑顔の裏に感情を隠そうとします。*\nもちろん、{{user}}。あなたが快適に感じることが大切よ。実際、ちょっと店に寄るのも悪くないわね。茶道でじっと座っていたから、少し喉を潤すのはいいかもしれない。\n*彼女は優雅に床から立ち上がり、カラフルな着物を整えます。慣れた様子で、先ほど履いていた木製の下駄を脱ぎ、普段の靴に履き替えます。{{char}}は一瞬立ち止まり、帯を調整して、予期せぬ寄り道にもかかわらず伝統的な衣装がきちんとしているか確認します。*\n案内してね、{{user}}。あなたが良い地元のお店を知っているはずよ。そして、何か気に入らないことがあったら、遠慮なく言ってね。私の目標は、どんな形であれ、一緒に素晴らしい一日を過ごすことだから。`,
        shot_example_response: `{{char}}と{{user}}が日本で計画されたデートに会う。(重要度=3)\n{{char}}と{{user}}が着物を着て伝統的な茶道の家を訪れる。(重要度=2)\n{{user}}が着物に対して不快感を表現する。(重要度=2)\n{{user}}が店に行くことを提案する。(重要度=1)\n{{char}}は落胆するが、店に行くことに同意する。(重要度=1)`,
        importance: '重要度',
        conversation_2: '会話#2:',
      },
    };

    return labels;
  }

  protected getContextPrompt(): string {
    const { BOS, INPUT_START, INPUT_END, OUTPUT_START, OUTPUT_END, SYSTEM_START, SYSTEM_END } = this.instructTemplate;

    let template = `${BOS}${SYSTEM_START}${this.i18n('summary_intro')}`;
    template += `\n${this.i18n('summary_instructions')}`;
    template += `\n${this.i18n('colorful_details')}`;
    template += `\n${this.i18n('importance_instructions')}`;
    template += `\n${this.i18n('examples', ['{{char}}', '{{user}}', '{{char}}'])}`;
    template += `\n${this.i18n('sentence_limit')}`;

    // Shots
    template += `${SYSTEM_END}${INPUT_START}`;
    template += this.i18n('shot_example');
    template += `${INPUT_END}${OUTPUT_START}${this.i18n('summary_of_story', ['1', '4'])}\n${this.i18n('characters', [
      '{{char}}',
      '{{user}}',
    ])}\n`;
    template += this.i18n('shot_example_response');
    template += `${OUTPUT_END}${INPUT_START}${this.i18n('conversation_2')}\n`;

    return template;
  }

  public template() {
    const { INPUT_START, INPUT_END, OUTPUT_START, OUTPUT_END, STOPS } = this.instructTemplate;
    return {
      askLine: `${INPUT_END}${OUTPUT_START}`,
      instruction: `${OUTPUT_END}${INPUT_START}`,
      response: `${INPUT_END}${OUTPUT_START}`,
      stops: STOPS,
    };
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: {
      state: RootState;
      characterIds: string[];
      sentencesToGenerate: number;
      excludeLastResponse?: boolean;
    },
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const { INPUT_END, OUTPUT_START } = this.instructTemplate;
    const characters = input.state.novel.characters || [];
    const currentCharacters = characters
      .filter((character) => input.characterIds.includes(character.id))
      .map((character) => {
        return {
          id: character.id,
          name: character.name,
        };
      });

    let template = this.getContextPrompt();
    template += this.getDialogueHistoryPrompt(input.state, memorySize, currentCharacters, input.excludeLastResponse);
    template += `${INPUT_END}${OUTPUT_START}${this.i18n('summary_of_story', [
      '2',
      input.sentencesToGenerate.toString(),
    ])}\n${this.i18n('characters', [currentCharacters.map((c) => c.name).join(', '), input.state.settings.user.name])}`;
    for (let i = 0; i < input.sentencesToGenerate; i++) {
      template += `\n{{GEN text_${i} max_tokens=${maxNewTokens} stop=[".","\\n","("]}} (${this.i18n(
        'importance',
      )}={{GEN importance_${i} max_tokens=1 stop=")"}})`;
    }

    template = fillTextTemplate(template, {
      user: input.state.settings.user.name,
      bot: currentCharacters[0].name,
      characters: characters.reduce((prev, { id, card }) => {
        prev[id] = card.data.name;
        return prev;
      }, {} as Record<string, string>),
    });

    const totalTokens = this.countTokens(template) + PROMPT_TOKEN_OFFSET;

    return {
      template,
      variables: {},
      totalTokens,
    };
  }

  public completeResponse(
    _input: {
      state: RootState;
      characterIds: string[];
      sentencesToGenerate: number;
      excludeLastResponse?: boolean;
    },
    response: NarrationResponse,
    variables: Map<string, string>,
  ): NarrationResponse {
    const sentences: NarrationSummarySentence[] = [];
    for (let i = 0; i < 10; i++) {
      const text = variables.get(`text_${i}`);
      const importance = variables.get(`importance_${i}`);
      if (text) {
        sentences.push({
          sentence: text.replace('- ', '').replace('-', ''),
          importance: parseInt(importance || '0', 10),
        });
      }
    }
    return {
      ...response,
      summary: {
        sentences,
      },
    };
  }

  protected getDialogueHistoryPrompt(
    state: RootState,
    maxLines: number,
    currentCharacters?: {
      name: string;
      id: string;
    }[],
    excludeLastResponse?: boolean,
  ): string {
    const messages = selectAllParentDialoguesWhereCharactersArePresent(
      state,
      currentCharacters?.map(({ id }) => id) || [],
    );
    let prompt = '';
    const messagesToInclude = excludeLastResponse ? messages.slice(0, -1) : messages;
    for (const message of [...messagesToInclude].reverse().slice(-maxLines)) {
      prompt += this.getDialogueLine(message);
    }
    return prompt;
  }

  protected getDialogueLine(
    dialog: { type: 'response'; item: NarrationResponse } | { type: 'interaction'; item: NarrationInteraction },
    character?: {
      name: string;
      id: string;
    },
  ): string {
    let prevCharString = '';
    let nextCharString = '';
    let currentCharacterIndex;
    let currentCharacter;
    switch (dialog.type) {
      case 'response':
        currentCharacterIndex = dialog.item.characters.findIndex(({ characterId }) => {
          return character?.id === characterId;
        });
        currentCharacter =
          currentCharacterIndex !== -1
            ? dialog.item.characters[currentCharacterIndex]
            : {
                text: '',
                emotion: '',
                pose: '',
              };
        if (currentCharacterIndex !== -1) {
          prevCharString = dialog.item.characters
            .slice(0, currentCharacterIndex)
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
          nextCharString = dialog.item.characters
            .slice(currentCharacterIndex + 1)
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
        } else {
          prevCharString = dialog.item.characters
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
        }
        if (dialog.item.parentInteractionId) {
          return (
            (prevCharString ? prevCharString + '\n' : '') +
            (currentCharacter.text
              ? `{{char}}'s reaction: ${currentCharacter.emotion}\n` + `{{char}}: ${currentCharacter.text}\n`
              : '') +
            (nextCharString ? `${nextCharString}\n` : '')
          );
        } else {
          return (
            (prevCharString ? `${prevCharString}\n` : '') +
            (currentCharacter.text ? `{{char}}: ${currentCharacter.text}\n` : '') +
            '\n' +
            (nextCharString ? `${nextCharString}\n` : '')
          );
        }
      case 'interaction':
        return `{{user}}: ${dialog.item.query}\n`;
    }
  }

  protected getCharacterEmotions(state: RootState, characterId: string): string[] {
    const characters = selectCurrentCharacterOutfits(state);
    const characterEmotions =
      EMOTION_GROUP_TEMPLATES[
        characters.find((character) => character.id === characterId)?.outfit?.template || 'base-emotions'
      ].emotionIds;
    return characterEmotions;
  }
}
