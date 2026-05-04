'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import styles from './ProductDetail.module.css';
import {
  MODAL_CONTENT,
  COMPARISON_TABLE,
  HOW_TO_USE_STEPS,
  XEM_INGREDIENTS,
  XEM_CLAIMS,
  type ModalContent,
} from './MODAL_CONTENT_DATA';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Modal({ content, onClose }: { content: ModalContent; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modalSheet}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHandle} />
          <button className={styles.modalClose} onClick={onClose}>×</button>

          {content.eyebrow && <div className={styles.modalEyebrow}>{content.eyebrow}</div>}
          {content.stat && <div className={styles.modalStat}>{content.stat}</div>}
          <h3 className={styles.modalTitle}>{content.title}</h3>

          {content.ingredientRole && (
            <div className={styles.modalEyebrow} style={{ marginBottom: 16 }}>{content.ingredientRole}</div>
          )}

          {content.paragraphs.map((p, i) => (
            <p key={i} className={styles.modalBody}>{p}</p>
          ))}

          {content.sources && content.sources.length > 0 && (
            <div style={{ marginTop: 24 }}>
              {content.sources.map((s, i) => (
                <div key={i} className={styles.modalSource}>
                  <div className={styles.modalSourceLabel}>{s.label}</div>
                  <div className={styles.modalSourceText}>{s.text}</div>
                </div>
              ))}
            </div>
          )}

          {content.warning && (
            <div className={styles.modalWarning}>{content.warning}</div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ProductDetailPage() {
  const [activeModal, setActiveModal] = useState<ModalContent | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const openModal = (key: string) => setActiveModal(MODAL_CONTENT[key] ?? null);

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero} ref={heroRef}>
        <motion.div className={styles.heroBg} style={{ y: heroY }}>
          <video autoPlay loop muted playsInline>
            <source src="/videos/waterball.mp4" type="video/mp4" />
          </video>
        </motion.div>
        <div className={styles.heroGradient} />

        <motion.div className={styles.heroContent} style={{ opacity: heroOpacity }}>
          <motion.p
            className={styles.eyebrow}
            initial={{ opacity: 0, letterSpacing: '0.15em' }}
            animate={{ opacity: 1, letterSpacing: '0.36em' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >
            Breathe · Refresh · Restore
          </motion.p>
          <motion.h1
            className={styles.h1}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            Your airway.<br />
            <em>Refreshed daily.</em>
          </motion.h1>
          <motion.p
            className={styles.heroSub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.55 }}
          >
            A high-fidelity misting system designed to restore what the environment takes away. Pure hydration for your most vital passage.
          </motion.p>
          <motion.div
            className={styles.heroCtas}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
          >
            <button className={styles.btnPrimary}>Start Your 30-Day Trial</button>
            <button className={styles.btnGhost} onClick={() => openModal('howItWorks')}>How it works</button>
          </motion.div>
        </motion.div>

        <div className={styles.scrollHint}>
          <div className={styles.scrollLine} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── PROBLEM CONTEXT ── */}
      <div className={styles.sectionDark}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <motion.p
              className={styles.eyebrow}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >Why it matters</motion.p>
            <motion.h2
              className={styles.h2}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              Your environment asks a lot<br />of your airway. <em>Every day.</em>
            </motion.h2>
            <motion.p
              className={styles.bodyText}
              style={{ maxWidth: 560 }}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              Modern life is spent in conditioned air. From offices to long-haul flights, your airway is constantly losing moisture — the invisible tax of being indoors.
            </motion.p>
          </div>

          <motion.div
            className={styles.statRow}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            {[
              { key: 'statOffice', num: '20', unit: '%', label: 'Office Humidity', desc: 'HVAC systems maintain 20–30% RH — half of what your airway prefers.' },
              { key: 'statFlight', num: '10', unit: '%', label: 'Cabin Air Humidity', desc: 'Aircraft cabin air at cruising altitude. Drier than the Sahara Desert.' },
              { key: 'statRun', num: '100', unit: 'L', label: 'Air Intake Per Minute', desc: 'At peak exertion, your airway filters massive volumes of dry air.' },
            ].map((s) => (
              <motion.div
                key={s.key}
                className={`${styles.glassCard} ${styles.statCard}`}
                variants={fadeUp}
                onClick={() => openModal(s.key)}
              >
                <div className={styles.statNum}>
                  <span className={styles.statNumAccent}>{s.num}</span>
                  <span className={styles.statUnit}>{s.unit}</span>
                </div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statDesc}>{s.desc}</div>
                <div className={styles.tapHint}>
                  <span>View data</span>
                  <span>→</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      {/* ── THE SYSTEM ── */}
      <div className={styles.sectionDarker}>
        <section className={styles.section}>
          <div className={styles.sectionHeaderCentered}>
            <motion.p className={styles.eyebrow} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              The System
            </motion.p>
            <motion.h2 className={styles.h2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              Two parts. One daily ritual.
            </motion.h2>
          </div>

          <motion.div
            className={styles.systemGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            {/* Bliz */}
            <motion.div className={`${styles.glassCard} ${styles.systemCard}`} variants={fadeUp}>
              <div className={styles.productTag}>Device</div>
              <h3 className={styles.h3}>Bliz</h3>
              <p className={styles.productDesc}>
                A precision-engineered misting device calibrated to 6 microns — the exact particle size that deposits in the nose, throat, and upper airway.
              </p>
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <span className={styles.featurePill}>6μm</span>
                  <span className={styles.featureText}>Optimal particle size for upper airway deposition. Not lungs — your nose and throat.</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featurePill}>7+ days</span>
                  <span className={styles.featureText}>Battery life per charge. One week of daily sessions on a single fill.</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featurePill}>90 sec</span>
                  <span className={styles.featureText}>Per session. Automatic shutoff. No settings, no decisions.</span>
                </div>
              </div>
              <button
                className={styles.tapHint}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 28 }}
                onClick={() => openModal('blizScience')}
              >
                Why 6 microns? →
              </button>
            </motion.div>

            {/* Xem */}
            <motion.div className={`${styles.glassCard} ${styles.systemCard} ${styles.systemCardAccent}`} variants={fadeUp}>
              <div className={styles.productTag}>Formula</div>
              <h3 className={styles.h3}>Xem</h3>
              <p className={styles.productDesc}>
                Pure hydration capsules. Saline-based, xylitol-enhanced, with clarifying eucalyptol and menthol. No alcohol. No preservatives. No artificial anything.
              </p>
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <span className={styles.featurePill}>Saline</span>
                  <span className={styles.featureText}>0.9% — isotonic with your airway surface. Nothing foreign.</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featurePill}>Xylitol</span>
                  <span className={styles.featureText}>Supports airway surface environment. FDA-classified GRAS.</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featurePill}>Eucalyptol</span>
                  <span className={styles.featureText}>Instant clarifying sensation. Long history in respiratory wellness.</span>
                </div>
              </div>
              <button
                className={styles.tapHint}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 28 }}
                onClick={() => openModal('systemCompare')}
              >
                How Bliz compares →
              </button>
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* ── COMPARISON TABLE ── */}
      <div className={styles.sectionDark}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <motion.p className={styles.eyebrow} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              The Difference
            </motion.p>
            <motion.h2 className={styles.h2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              Not all hydration<br />reaches your airway.
            </motion.h2>
          </div>
          <motion.div
            className={styles.tableWrap}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  {COMPARISON_TABLE.headers.map((h, i) => (
                    <th key={i} className={i === 3 ? styles.tableHighlight : ''}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_TABLE.rows.map((row, ri) => (
                  <tr key={ri}>
                    <td>{row.label}</td>
                    {row.values.map((v, vi) => (
                      <td key={vi} className={row.highlight === vi + 2 ? styles.tableCellHighlight : ''}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>
      </div>

      {/* ── INGREDIENTS ── */}
      <div className={styles.sectionDarker}>
        <section className={styles.section}>
          <div className={styles.sectionHeaderCentered}>
            <motion.p className={styles.eyebrow} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              The Formula
            </motion.p>
            <motion.h2 className={styles.h2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              Every ingredient.<br />A reason behind it.
            </motion.h2>
          </div>

          <motion.div
            className={styles.ingredientsGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            {[
              { key: 'xylitol', role: 'Airway environment support', name: 'Xylitol', desc: 'A naturally occurring sugar alcohol with a growing body of research in airway surface science. FDA-classified GRAS.' },
              { key: 'eucalyptol', role: 'Clarifying sensation', name: 'Eucalyptol', desc: 'The primary active compound in eucalyptus — long used in respiratory wellness. Gives Xem its signature clarity.' },
              { key: 'menthol', role: 'Open-airway feeling', name: 'Menthol', desc: 'Activates cold-sensing receptors (TRPM8) in your nasal passages. The feeling of a clear, easy breath.' },
            ].map((ing) => (
              <motion.div
                key={ing.key}
                className={`${styles.glassCard} ${styles.ingredientCard}`}
                variants={fadeUp}
                onClick={() => openModal(ing.key)}
              >
                <div className={styles.ingredientRole}>{ing.role}</div>
                <div className={styles.ingredientName}>{ing.name}</div>
                <div className={styles.ingredientDesc}>{ing.desc}</div>
                <div className={styles.ingredientLearnMore}>Research & sources →</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {XEM_CLAIMS.map((c) => (
              <span
                key={c}
                style={{
                  fontSize: 12,
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.05em',
                }}
              >
                {c}
              </span>
            ))}
            <button
              onClick={() => openModal('fullIngredients')}
              style={{
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid rgba(28,136,255,0.2)',
                color: 'rgba(28,136,255,0.6)',
                background: 'none',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              Full ingredient list →
            </button>
          </motion.div>
        </section>
      </div>

      {/* ── HOW TO USE ── */}
      <div className={styles.sectionDark}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <motion.p className={styles.eyebrow} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              The Ritual
            </motion.p>
            <motion.h2 className={styles.h2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              90 seconds.<br />Anytime, anywhere.
            </motion.h2>
          </div>

          <motion.div
            className={styles.stepsGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            {HOW_TO_USE_STEPS.map((step) => (
              <motion.div key={step.num} className={styles.stepItem} variants={fadeUp}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      {/* ── WHEN TO USE ── */}
      <div className={styles.sectionDarker}>
        <section className={styles.section}>
          <div className={styles.sectionHeaderCentered}>
            <motion.p className={styles.eyebrow} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              When to use
            </motion.p>
            <motion.h2 className={styles.h2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              Fits every part<br />of your day.
            </motion.h2>
          </div>

          <motion.div
            className={styles.ritualGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            {[
              { t: 'Morning', title: 'Wake up refreshed', desc: 'Hydrate your airway after hours of dry sleep air. Start the day clear.' },
              { t: 'Office', title: 'Focus in comfort', desc: 'Counter the invisible toll of HVAC-conditioned air across a full workday.' },
              { t: 'After exercise', title: 'Post-activity reset', desc: 'At 100L/min, your airway works hard. Give it what it lost.' },
              { t: 'Evening', title: 'Sleep ready', desc: 'Prep your airway for rest. One session before bed.' },
            ].map((r) => (
              <motion.div key={r.t} className={`${styles.glassCard} ${styles.ritualCard}`} variants={fadeUp}>
                <div className={styles.ritualTime}>{r.t}</div>
                <div className={styles.ritualTitle}>{r.title}</div>
                <div className={styles.ritualDesc}>{r.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      {/* ── CTA ── */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <div className={styles.ctaInner}>
          <motion.p className={styles.eyebrow} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            The Trial
          </motion.p>
          <motion.h2 className={styles.h2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            Try it. Risk nothing.
          </motion.h2>
          <motion.p className={styles.bodyText} style={{ maxWidth: 480, margin: '0 auto' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            30 days to find out if Bliz is for you. If it isn&apos;t, we&apos;ll refund you in full.
          </motion.p>

          <motion.div className={styles.priceRow} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className={styles.price}>$99</div>
            <div className={styles.priceDivider} />
            <ul className={styles.includesList}>
              <li>Bliz Misting Device</li>
              <li>15 Xem Hydration Capsules</li>
              <li>Personalized Routine Guide</li>
              <li>Free Shipping</li>
            </ul>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <button className={styles.btnPrimary} style={{ fontSize: 17, padding: '20px 52px' }}>
              Get My Trial Kit →
            </button>
            <p className={styles.refundNote}>Full refund within 30 days. No questions asked.</p>
          </motion.div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {activeModal && (
        <Modal content={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
