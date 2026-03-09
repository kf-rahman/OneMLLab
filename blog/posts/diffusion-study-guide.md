---
title: Diffusion Models Learning Plan
date: 2026-03-08
author: Kazi Rahman
excerpt: Here is how I plan to build a foundation in diffusion models.
slug: diffusion-study-guide
---

This post is a contract with myself: build a real foundation in diffusion models so I can eventually develop strong intuition for world models. Rather than collecting random links, I want a study plan with clear stages, concrete readings, and a way to test whether I actually understand the material.

Here is the plan.

## 1. The Mathematics

The first step is getting comfortable with the mathematical ideas that keep showing up in diffusion papers.

- The special role of Gaussian distributions
- The relationship between Markov chains and Gaussian transitions
- What the reparameterization trick is doing

These are deliberately high-level prompts. The goal is to ask better questions, fill in missing background when needed, and review the right concepts at the right time.

**Readings**

- Lilian Weng, "From Autoencoder to Beta-VAE"
- *Deep Learning* by Goodfellow, Bengio, and Courville: Chapters 3 and 16
- *Pattern Recognition and Machine Learning* by Bishop: Chapters 1 and 2

**So what?**

After the readings, I need to pressure-test whether I can use the ideas, not just restate them. In the LLM era, typing code line by line matters less than making the right architectural and debugging decisions.

- Look at a converging Markov chain and identify the distribution it is approaching, then ask how the transition process could be modified
- Work out KL divergence between two Gaussians
- Debug a simple 1D Gaussian setup from first principles

## 2. Score-Based Generative Models

**Key concepts**

- What generative models are trying to do: learn `p(x)` from data
- Why likelihood-based models can be difficult in practice
- Score matching: learn `∇ log p(x)` instead of `p(x)`
- Langevin dynamics as a sampling procedure
- Noise-conditioned score networks (NCSN)

**Readings**

- Hyvarinen (2005), "Estimation of Non-Normalized Statistical Models by Score Matching"
- Song and Ermon (2019), "Generative Modeling by Estimating Gradients of the Data Distribution"
- Yang Song, "Generative Modeling by Estimating Gradients of the Data Distribution"
- Lilian Weng, "What are Diffusion Models?" (first half)

**So what?**

- Explain what score matching is and why it may be preferable to maximum likelihood in some generative settings
- Explain how an NCSN works and how it can be applied to datasets

## 3. Diffusion Probabilistic Models

**Key concepts**

- The forward process: adding Gaussian noise over many steps
- The closed-form forward process and why direct jumps are possible
- The reverse process: learning to denoise step by step
- Why the ELBO simplifies into a noise-prediction objective
- The U-Net denoiser architecture
- Variance schedules such as linear and cosine

**Readings**

- Ho et al. (2020), "Denoising Diffusion Probabilistic Models"
- Lilian Weng, "What are Diffusion Models?"
- "The Annotated Diffusion Model" from Hugging Face
- Yannic Kilcher's DDPM walkthrough
- Relevant Andrej Karpathy lectures on generative models

**So what?**

- Break down DDPM clearly enough to explain it from memory
- Describe what the loss is optimizing and how training should behave

## 4. Sampling Efficiency and DDIM

**Key concepts**

- Why DDPM inference is slow when sampling requires many steps
- How non-Markovian sampling changes the process
- DDIM as deterministic versus stochastic sampling
- The trade-off between speed and sample diversity

**Readings**

- Song et al. (2021), "Denoising Diffusion Implicit Models"
- Hugging Face's annotated DDIM walkthrough

**So what?**

- Compare DDPM and DDIM in terms of assumptions, speed, and outputs

## 5. Classifier-Free Guidance and Conditional Generation

**Key concepts**

- Classifier guidance with a separate classifier during sampling
- Classifier-free guidance built directly into the model
- Conditioning on text, images, class labels, or other signals
- Guidance scale as a trade-off between diversity and fidelity
- Cross-attention as a conditioning mechanism inside U-Nets

**Readings**

- Dhariwal and Nichol (2021), "Diffusion Models Beat GANs on Image Synthesis"
- Ho and Salimans (2022), "Classifier-Free Diffusion Guidance"
- Lilian Weng's diffusion posts on classifier-free guidance

**So what?**

- Explain how guidance changes the sampling process and what trade-offs it introduces
- Be able to describe how text conditioning plugs into a diffusion model

## What Success Looks Like

I will consider this phase successful if I can explain the full diffusion pipeline in plain language, connect the key math to the model design, and reason about implementation choices without depending entirely on other people's code.
