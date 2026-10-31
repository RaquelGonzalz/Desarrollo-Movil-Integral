import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createClient, normalizeQuery } from './src/library.mjs';

const COLORS = ['#B8A4FF', '#F6C686', '#90D9CA', '#F4AEC3'];

export default function App() {
  return (
    <SafeAreaProvider>
      <Catalog />
    </SafeAreaProvider>
  );
}

function Catalog() {
  const client = useRef(createClient());
  const mounted = useRef(true);
  const busy = useRef(false);

  const [query, setQuery] = useState('Don Quijote');
  const [mode, setMode] = useState('title');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [lastSearch, setLastSearch] = useState(null);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  async function search(refresh = false) {
    if (busy.current) return;

    const selectedMode =
      refresh && lastSearch ? lastSearch.mode : mode;

    let text;

    try {
      text = normalizeQuery(
        refresh && lastSearch ? lastSearch.query : query
      );
    } catch (e) {
      setError(e.message);
      return;
    }

    Keyboard.dismiss();
    busy.current = true;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await client.current(
        text,
        selectedMode,
        refresh
      );

      if (mounted.current) {
        setResult(data);
        setLastSearch({
          query: text,
          mode: selectedMode,
        });
      }
    } catch (e) {
      if (mounted.current) {
        setError(e.message || 'No se pudo completar la búsqueda.');
      }
    } finally {
      busy.current = false;

      if (mounted.current) {
        setLoading(false);
      }
    }
  }

  function useSuggestion(text, selectedMode) {
    setQuery(text);
    setMode(selectedMode);
    setError('');
  }

  async function openSource() {
    try {
      await Linking.openURL('https://openlibrary.org');
    } catch {
      setError('No se pudo abrir Open Library.');
    }
  }

  function renderBook({ item, index }) {
    const accent = COLORS[index % COLORS.length];

    const initial = item.title
      .trim()
      .slice(0, 1)
      .toUpperCase();

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookTop}>
          <View
            style={[
              styles.cover,
              { backgroundColor: accent },
            ]}
          >
            <View style={styles.coverSpine} />

            <Text style={styles.coverInitial}>
              {initial}
            </Text>

            <Text style={styles.coverLabel}>
              LIBRO
            </Text>
          </View>

          <View style={styles.bookInfo}>
            <Text style={styles.bookNumber}>
              RESULTADO {String(index + 1).padStart(2, '0')}
            </Text>

            <Text style={styles.bookTitle}>
              {item.title}
            </Text>

            <Text style={styles.author}>
              {item.authors}
            </Text>
          </View>
        </View>

        <View style={styles.bookBottom}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>
              PRIMERA PUBLICACIÓN
            </Text>

            <Text style={styles.metricValue}>
              {item.year}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>
              EDICIONES
            </Text>

            <Text style={styles.metricValue}>
              {item.editions}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const header = (
    <View>
      <View style={styles.topbar}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>L</Text>
          </View>

          <Text style={styles.brandName}>
            LibroConsulta
          </Text>
        </View>

        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>
            EXPLORAR
          </Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>
          TU PRÓXIMA HISTORIA EMPIEZA AQUÍ
        </Text>

        <Text style={styles.heroTitle}>
          Un mundo{'\n'}
          <Text style={styles.heroAccent}>
            entre páginas.
          </Text>
        </Text>

        <Text style={styles.heroDescription}>
          Descubre libros, encuentra autores y explora
          nuevas ideas en un solo lugar.
        </Text>
      </View>

      <View style={styles.searchPanel}>
        <View style={styles.panelHeading}>
          <Text style={styles.panelTitle}>
            ¿Qué quieres descubrir?
          </Text>

          <Text style={styles.panelIcon}>✦</Text>
        </View>

        <View style={styles.tabs}>
          {[
            ['title', 'Por título'],
            ['author', 'Por autor'],
          ].map(([value, label]) => {
            const selected = mode === value;

            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                  disabled: loading,
                }}
                disabled={loading}
                onPress={() => {
                  setMode(value);
                  setError('');
                }}
                style={[
                  styles.tab,
                  selected && styles.tabSelected,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    selected && styles.tabTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>
          {mode === 'title'
            ? 'Título del libro'
            : 'Nombre del autor'}
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>⌕</Text>

          <TextInput
            accessibilityLabel={
              mode === 'title'
                ? 'Título del libro'
                : 'Nombre del autor'
            }
            value={query}
            onChangeText={setQuery}
            placeholder={
              mode === 'title'
                ? 'Escribe un título…'
                : 'Escribe un autor…'
            }
            placeholderTextColor="#738096"
            selectionColor="#B8A4FF"
            style={styles.input}
            editable={!loading}
            maxLength={80}
            returnKeyType="search"
            onSubmitEditing={() => search()}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
          disabled={loading}
          onPress={() => search()}
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.buttonPressed,
            loading && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#17142B" />
          ) : (
            <>
              <Text style={styles.searchButtonText}>
                Explorar libros
              </Text>

              <Text style={styles.searchArrow}>→</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.inputHint}>
          Entre 2 y 80 caracteres · Hasta 12 resultados
        </Text>
      </View>

      <View style={styles.suggestions}>
        <Text style={styles.suggestionsLabel}>
          Prueba con
        </Text>

        <View style={styles.suggestionRow}>
          {[
            ['Don Quijote', 'title'],
            ['Isabel Allende', 'author'],
            ['Harry Potter', 'title'],
          ].map(([text, selectedMode]) => (
            <Pressable
              key={text}
              accessibilityRole="button"
              disabled={loading}
              onPress={() =>
                useSuggestion(text, selectedMode)
              }
              style={styles.suggestion}
            >
              <Text style={styles.suggestionText}>
                {text}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading && (
        <View
          style={styles.stateCard}
          accessibilityLiveRegion="polite"
        >
          <ActivityIndicator
            size="large"
            color="#B8A4FF"
          />

          <Text style={styles.stateTitle}>
            Buscando nuevas historias
          </Text>

          <Text style={styles.stateDescription}>
            Estamos consultando Open Library…
          </Text>
        </View>
      )}

      {!!error && (
        <View
          style={styles.errorCard}
          accessibilityRole="alert"
        >
          <Text style={styles.errorTitle}>
            Revisa tu consulta
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      {result && (
        <View style={styles.resultsHeading}>
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsEyebrow}>
              TU BÚSQUEDA
            </Text>

            <Text style={styles.resultsTitle}>
              {result.total.toLocaleString()} coincidencias
            </Text>

            <Text style={styles.resultsDescription}>
              {lastSearch?.query}
              {' · '}
              {result.books.length} en esta página
            </Text>

            <Text style={styles.cacheLabel}>
              {result.cached
                ? 'Resultados de caché temporal'
                : 'Resultados obtenidos en línea'}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Actualizar última consulta"
            disabled={loading}
            onPress={() => search(true)}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshIcon}>↻</Text>
            <Text style={styles.refreshText}>
              Actualizar
            </Text>
          </Pressable>
        </View>
      )}

      {result && result.books.length === 0 && (
        <View style={styles.stateCard}>
          <View style={styles.stateSymbol}>
            <Text style={styles.stateSymbolText}>?</Text>
          </View>

          <Text style={styles.stateTitle}>
            No encontramos ese libro
          </Text>

          <Text style={styles.stateDescription}>
            Intenta con otro título o busca por el nombre
            de su autor.
          </Text>
        </View>
      )}

      {!result && !loading && !error && (
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeSymbol}>✦</Text>

          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeTitle}>
              Hay mucho por descubrir
            </Text>

            <Text style={styles.welcomeText}>
              Elige un título o un autor y comienza
              tu búsqueda.
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      <FlatList
        data={result?.books ?? []}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.footerLine} />

            <Pressable
              accessibilityRole="link"
              onPress={openSource}
            >
              <Text style={styles.footerSource}>
                Datos de Open Library · Internet Archive ↗
              </Text>
            </Pressable>

            <Text style={styles.footerDescription}>
              Consulta bibliográfica educativa.
              {'\n'}
              Explora metadatos sin descargar libros.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0C1220',
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 30,
  },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 35,
    height: 39,
    borderRadius: 10,
    backgroundColor: '#B8A4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#201B39',
    fontSize: 25,
    fontWeight: '900',
  },
  brandName: {
    color: '#F5F4FB',
    fontSize: 18,
    fontWeight: '800',
  },
  topBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#343049',
    borderRadius: 20,
  },
  topBadgeText: {
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#C3B5F6',
  },

  hero: {
    paddingTop: 38,
    paddingBottom: 27,
  },
  eyebrow: {
    color: '#A99BCB',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 13,
  },
  heroTitle: {
    color: '#FAF9FD',
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -1.5,
    fontWeight: '800',
  },
  heroAccent: {
    color: '#B8A4FF',
  },
  heroDescription: {
    color: '#A2AEC0',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 15,
    maxWidth: 420,
  },

  searchPanel: {
    backgroundColor: '#171F30',
    borderWidth: 1,
    borderColor: '#2C3548',
    borderRadius: 24,
    padding: 20,
  },
  panelHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  panelTitle: {
    flex: 1,
    color: '#F3F1FB',
    fontSize: 17,
    fontWeight: '700',
  },
  panelIcon: {
    color: '#B8A4FF',
    fontSize: 24,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#0E1523',
    padding: 4,
    borderRadius: 13,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  tabSelected: {
    backgroundColor: '#303248',
  },
  tabText: {
    color: '#8D9BAF',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: '#EEE8FF',
  },
  inputLabel: {
    color: '#BEC8D8',
    fontSize: 12,
    marginBottom: 9,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101827',
    borderWidth: 1,
    borderColor: '#384359',
    borderRadius: 13,
    paddingHorizontal: 13,
    minHeight: 54,
  },
  inputIcon: {
    color: '#AFA1DF',
    fontSize: 28,
    marginRight: 9,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: '#F6F3FF',
    fontSize: 15,
    paddingVertical: 15,
  },
  searchButton: {
    minHeight: 53,
    marginTop: 14,
    backgroundColor: '#B8A4FF',
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  searchButtonText: {
    color: '#1C1730',
    fontSize: 15,
    fontWeight: '800',
  },
  searchArrow: {
    color: '#1C1730',
    fontSize: 22,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  inputHint: {
    color: '#8E9DB2',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },

  suggestions: {
    marginTop: 19,
    marginBottom: 10,
  },
  suggestionsLabel: {
    color: '#8997AD',
    fontSize: 11,
    marginBottom: 10,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestion: {
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#2C374B',
    backgroundColor: '#131C2C',
  },
  suggestionText: {
    color: '#BBC5D5',
    fontSize: 11,
  },

  resultsHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 27,
    marginBottom: 20,
  },
  resultsInfo: {
    flex: 1,
  },
  resultsEyebrow: {
    color: '#B8A4FF',
    letterSpacing: 1.5,
    fontWeight: '700',
    fontSize: 9,
    marginBottom: 7,
  },
  resultsTitle: {
    color: '#F6F4FD',
    fontWeight: '700',
    fontSize: 21,
  },
  resultsDescription: {
    color: '#9DABC0',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  cacheLabel: {
    color: '#8593A8',
    fontSize: 10,
    marginTop: 4,
  },
  refreshButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#35364D',
    borderRadius: 14,
    backgroundColor: '#191F31',
  },
  refreshIcon: {
    color: '#C7B6FF',
    fontSize: 25,
  },
  refreshText: {
    color: '#C7B6FF',
    fontSize: 9,
    marginTop: 3,
  },

  bookCard: {
    backgroundColor: '#171F30',
    borderWidth: 1,
    borderColor: '#2A3448',
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
  },
  bookTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  cover: {
    width: 72,
    height: 101,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverSpine: {
    position: 'absolute',
    left: 6,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(20, 20, 40, 0.14)',
  },
  coverInitial: {
    color: '#242337',
    fontSize: 39,
    fontWeight: '800',
  },
  coverLabel: {
    color: '#39344A',
    fontSize: 7,
    letterSpacing: 2,
    marginTop: 9,
    fontWeight: '700',
  },
  bookInfo: {
    flex: 1,
    paddingTop: 3,
  },
  bookNumber: {
    color: '#9D90C4',
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: '700',
    marginBottom: 8,
  },
  bookTitle: {
    color: '#F4F1FC',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
  },
  author: {
    color: '#A6B2C5',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  bookBottom: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: '#2A3448',
    marginTop: 17,
    paddingTop: 14,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    color: '#8595AC',
    fontSize: 8,
    letterSpacing: 0.6,
    lineHeight: 14,
  },
  metricValue: {
    color: '#E2DCF3',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#303A4D',
    marginHorizontal: 18,
  },

  stateCard: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#141D2D',
    borderRadius: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  stateTitle: {
    color: '#EDE8FA',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 15,
  },
  stateDescription: {
    color: '#9CAAC0',
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 9,
    maxWidth: 300,
  },
  stateSymbol: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#302B49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateSymbolText: {
    color: '#C7B6FF',
    fontSize: 27,
    fontWeight: '700',
  },

  errorCard: {
    backgroundColor: '#35232E',
    borderWidth: 1,
    borderColor: '#6A3D4A',
    padding: 17,
    borderRadius: 16,
    marginTop: 20,
  },
  errorTitle: {
    color: '#FFB7C5',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  errorText: {
    color: '#E5B9C2',
    fontSize: 13,
    lineHeight: 21,
  },

  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: '#181E30',
    borderRadius: 18,
    padding: 19,
    marginTop: 20,
  },
  welcomeSymbol: {
    color: '#B8A4FF',
    fontSize: 35,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeTitle: {
    color: '#EAE4F8',
    fontSize: 14,
    fontWeight: '700',
  },
  welcomeText: {
    color: '#95A3B9',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 26,
    paddingBottom: 10,
  },
  footerLine: {
    height: 1,
    backgroundColor: '#283247',
    width: '100%',
    marginBottom: 22,
  },
  footerSource: {
    color: '#B8A4FF',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerDescription: {
    color: '#8492A8',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 8,
  },
});