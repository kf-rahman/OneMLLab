---
title: Diffusion Models Learning Plan
date: 2026-03-08
author: Kazi Rahman
excerpt: A structured path from diffusion fundamentals to world models.
slug: diffusion-study-guide
---

This post is a contract with myself: build a real foundation in diffusion models so I can eventually develop strong intuition for world models. The goal is not just to read papers. It is to study in a way that forces explanation, implementation, and clear judgment about why these models work.

The structure below is intentionally compact. Each section has a high-level overview, the key concepts to study, the questions to investigate, and a "so what" checkpoint that tests whether I actually learned something.

## 1. Mathematical Foundations

**High-level overview**

Diffusion models sit on a small set of mathematical ideas that appear everywhere: probability distributions, Gaussian structure, Markov transitions, KL divergence, and the score function. If these are weak, the rest of the field turns into memorized vocabulary instead of reasoning.

**Key concepts**

- Probability distributions, likelihood, and KL divergence
- Bayes' theorem and conditional probability
- Why Gaussian distributions are so useful
- Markov chains and transition processes
- The reparameterization trick
- What a score function means: `∇ log p(x)`

**Questions to look into**

- Why do Gaussian distributions keep appearing in generative modeling?
- What does it really mean for a Markov chain to converge to a distribution?
- How is KL divergence used as a design and debugging tool?
- Why is the score function a more useful object than the density itself in some settings?
- What does the reparameterization trick buy us computationally?

**So what?**

I should be able to implement a 1D Gaussian, compute KL divergence between two Gaussians from scratch, and build a simple Markov chain that converges to a known distribution. The knowledge test is whether I can explain, out loud and without notes, what a score function is and why it matters for generative models.

## 2. Score-Based Generative Models

**High-level overview**

Before modern diffusion models, the core idea was already there: learn how data should be denoised or nudged back toward high-probability regions by estimating the score. This section is the theoretical root of diffusion and the place where the "why" becomes clearer.

**Key concepts**

- What generative models are trying to learn
- Why likelihood-based training can be hard in practice
- Score matching as an alternative objective
- Langevin dynamics as a sampling process
- Noise-conditioned score networks (NCSN)

**Questions to look into**

- Why would learning `∇ log p(x)` be easier than learning `p(x)` directly?
- What assumptions make score matching work?
- How does Langevin dynamics turn a learned score into a sampler?
- Why do we need to condition the score network on noise level?
- What limitations show up when moving from toy data to real images?

**So what?**

I should be able to implement an NCSN on a toy 2D dataset, visualize the score field, and run Langevin sampling to see whether samples move toward the data distribution. The knowledge test is whether I can explain why score matching can outperform naive likelihood-based reasoning for some generative problems.

## 3. Core Diffusion Models: DDPM

**High-level overview**

DDPM is the core modern recipe: gradually corrupt data with noise, then train a model to reverse that corruption. This is the section where the field becomes operational rather than conceptual. If I understand this well, I should be able to explain the forward process, the reverse process, and the loss without relying on slogans.

**Key concepts**

- The forward noising process
- The closed-form jump to arbitrary noise levels
- The reverse denoising process
- Why the ELBO reduces to a practical noise-prediction loss
- U-Net as the denoiser backbone
- Variance schedules such as linear and cosine

**Questions to look into**

- Why can the forward process be written in closed form?
- Why is predicting noise equivalent to learning the reverse process?
- What role does the variance schedule play in training stability and sample quality?
- Why are U-Nets such a good fit for denoising?
- What should the loss curve and intermediate samples look like during training?

**So what?**

I should be able to implement DDPM on MNIST, visualize the forward process across time, train the denoiser, and inspect both loss curves and generated samples. The knowledge test is whether I can give a 15 minute explanation of DDPM from first principles without reading from the paper.

## 4. Efficient and Controlled Sampling

**High-level overview**

Once the core model is clear, the next question is practical: how do we sample faster and how do we control what gets generated? This section covers the transition from vanilla DDPM to methods like DDIM and classifier-free guidance, which are central to real systems.

**Key concepts**

- Why DDPM sampling is slow
- Non-Markovian sampling in DDIM
- Deterministic versus stochastic generation
- The speed versus diversity trade-off
- Classifier guidance and classifier-free guidance
- Conditioning on labels, text, images, or other signals
- Guidance scale and cross-attention

**Questions to look into**

- Why does DDIM allow fewer sampling steps than DDPM?
- What do we lose, if anything, when we speed up sampling?
- How does classifier-free guidance work without a separate classifier?
- Why does guidance scale improve fidelity but reduce diversity?
- How does text or class conditioning actually enter the denoiser?

**So what?**

I should be able to add DDIM sampling to a DDPM implementation, compare 10, 50, 100, and 1000 step generation, and then add class conditioning plus classifier-free guidance on a dataset like MNIST. The knowledge test is whether I can explain how speed, fidelity, diversity, and controllability trade off against each other in practice.

## 5. From Diffusion to Latent Models, Video, and World Models

**High-level overview**

The end goal is not image generation in isolation. It is understanding how diffusion ideas scale into latent diffusion, video generation, and eventually world models that predict futures under actions. This is the bridge from "cool sampler" to "useful model of the world."

**Key concepts**

- Why latent diffusion is more scalable than pixel-space diffusion
- The role of VAEs in compressing data before diffusion
- Stable Diffusion as a composition of VAE, denoiser, and conditioning model
- Extending diffusion from images to video with temporal structure
- Factorized spatial and temporal attention
- World models as predictors of future states or observations
- The relationship between video generation and learned simulators

**Questions to look into**

- Why is latent space the practical place to run large diffusion models?
- What exactly is the VAE doing in latent diffusion?
- What changes when the model must represent time rather than a single image?
- How do action signals or first-frame conditioning shape generation?
- In what sense can a video model act like a world model?
- Where does flow matching enter as an alternative, especially for robotics?

**So what?**

I should be able to train a small VAE, compare latent-space versus pixel-space diffusion, extend a simple model to short video sequences, and build a toy world model that predicts next state from state and action. The knowledge test is whether I can explain how diffusion connects to video simulators and why that matters for world models and robotics.

## Readings

### Mathematical Foundations

- *Deep Learning* by Goodfellow, Bengio, and Courville: Chapters 3 and 16
- *Pattern Recognition and Machine Learning* by Bishop: Chapters 1 and 2
- Lilian Weng, "From Autoencoder to Beta-VAE"
- 3Blue1Brown probability and Bayes' theorem videos

### Score-Based Generative Models

- Hyvarinen (2005), "Estimation of Non-Normalized Statistical Models by Score Matching"
- Song and Ermon (2019), "Generative Modeling by Estimating Gradients of the Data Distribution"
- Yang Song, "Generative Modeling by Estimating Gradients of the Data Distribution"
- Lilian Weng, "What are Diffusion Models?" (first half)

### Core Diffusion Models

- Ho et al. (2020), "Denoising Diffusion Probabilistic Models"
- Lilian Weng, "What are Diffusion Models?"
- "The Annotated Diffusion Model" from Hugging Face
- Yannic Kilcher's DDPM walkthrough
- Relevant Andrej Karpathy lectures on generative models

### Efficient and Controlled Sampling

- Song et al. (2021), "Denoising Diffusion Implicit Models"
- Dhariwal and Nichol (2021), "Diffusion Models Beat GANs on Image Synthesis"
- Ho and Salimans (2022), "Classifier-Free Diffusion Guidance"
- Hugging Face's annotated DDIM walkthrough
- Lilian Weng's diffusion writing on guidance

### Latent Diffusion, Video, and World Models

- Rombach et al. (2022), "High-Resolution Image Synthesis with Latent Diffusion Models"
- Ho et al. (2022), "Video Diffusion Models"
- Blattmann et al. (2023), "Align Your Latents: High-Resolution Video Synthesis with Latent Diffusion Models"
- OpenAI (2024), "Sora" technical report
- Lilian Weng, "Video Generation Models as World Simulators"
- Ha and Schmidhuber (2018), "World Models"
- Hafner et al. (2020), "Dream to Control: Learning Behaviors by Latent Imagination"
- Hafner et al. (2021), "Mastering Atari with Discrete World Models"
- Lipman et al. (2023), "Flow Matching for Generative Modeling"

## What Success Looks Like

I will consider this study plan successful if I can explain the full path from score matching to DDPM, from DDPM to controllable and efficient generation, and from diffusion to video and world models. More importantly, I should be able to prove that understanding by implementing simplified versions, diagnosing failures, and teaching the ideas clearly.
